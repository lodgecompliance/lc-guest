<template>
    <data-container :loading="loading" :error="error" @retry="getPropertyCustomer">
        <div v-if="cards.length">
          <div class="grey--text text-center">
            <small>Your authorized card at {{ property.name }} </small>
          </div>
            <v-radio-group 
                v-model="creditCard" 
                :label="``"
                :rules="[(value) => !value && !addCard ? 'Select a credit card' : true]"
                >
                    <v-radio
                        v-for="(card, c) in cards" :key="c"
                        :value="card"
                    >
                        <template #label>
                            <div class="pr-2" style="width: 100%">
                                <paystack-credit-card class="my-1" :card="card" />
                            </div>
                        </template>
                    </v-radio>
                </v-radio-group>
            <div class="text-center">
              <v-btn
                  v-if="canCreateNew"
                  text color="primary" small
                  @click.prevent="addCard = !addCard">Use another card </v-btn>
            </div>
        </div>
        <div v-else class="grey--text">
          <small>No authorized card at {{ property.name }} yet </small>
        </div>
        <div v-if="addCard">
            <paystack-new-credit-card
                :property="property"
                :reservation="reservation"
                @credit-card="creditCardReceived"
            />
        </div>
         <v-alert v-if="error"
            border="left"
            colored-border
            type="error">
                {{ error }}
        </v-alert>
    </data-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import gql from 'graphql-tag';

import DataContainer from '@/components/DataContainer.vue';
import PaystackCreditCard from '@/components/Utilities/PaystackCreditCard.vue';
import PaystackNewCreditCard from '@/components/Utilities/PaystackNewCreditCard.vue';
import config from "@/config";

export default {
    name: "PaystackCreditCardSelect",
    data(){
        return {
            loading: false,
            customer: null,
            addCard: false,
            creditCard: null,
            confirmation: {
                text: String,
                action: Function
            },
            error: null
        }
    },
    components: {
        DataContainer, PaystackCreditCard, PaystackNewCreditCard
    },

    props: {
        reservation: Object,
        property: Object,
        value: Object,
        canCreateNew: Boolean,
    },

    computed: {
        ...mapGetters(['current_user']),
        cards(){
            return this.customer?.authorizations || [];
        }
    },

    methods: {
        ...mapActions([
            'query', 'mutate'
        ]),

        getPropertyIntegration() {
          return new Promise((resolve, reject) => {
            this.query({
              query: gql`
                query getPropertyById($id: ID!){
                  getPropertyById(id: $id){
                    integrations {
                      paystack {
                        integration_id
                      }
                    }
                  }
               }`,
              variables: {
                id: this.property.id
              }
            }).then(response => {
              this.propertyIntegration = response.data.getPropertyById?.integrations?.paystack;
              if(this.propertyIntegration && this.propertyIntegration.integration_id) {
                return resolve(this.propertyIntegration)
              } else {
                return reject(new Error('Gateway not enabled for property'))
              }
            })
          })
        },

        getPaystackCustomer(){
          return this.getPropertyIntegration()
            .then(() => {
              return this.query({
                domain: config.apollo.account,
                query: gql `
                      query getBusinessPaystackCustomer($business_id: ID!, $integration_id: ID!, $user_id: ID!) {
                          getBusinessPaystackCustomer(business_id: $business_id, integration_id: $integration_id, user_id: $user_id) {
                              first_name
                              last_name
                              email
                              phone
                              authorizations {
                                  authorization_code
                                  card_type
                                  last4
                                  exp_month
                                  exp_year
                                  reusable
                                  bank
                              }
                          }
                      }
                  `,
                variables: {
                  business_id: this.property.business_id,
                  integration_id: this.propertyIntegration.integration_id,
                  user_id: this.current_user.profile.id
                }
              })
          })
            .then(response => {
                this.customer = response.data.getBusinessPaystackCustomer;
                return this.customer;
            })
            .catch(e => this.error = e)
            .finally(() => this.loading = false )
        },

        getPropertyCustomer() {
          this.loading = true;
          this.getPaystackCustomer()
          .then(customer => {
            this.$emit('customer-fetched', customer)
            if(!this.cards.length) this.addCard = true;
            else this.creditCard = this.cards[0];
          })
          .catch(e => this.error = e)
          .finally(() => this.loading = false)
        },

        creditCardReceived(card) {
            if(this.customer) {
                this.customer.authorizations.push(card);
            } else {
                this.customer = {
                    authorizations: [card]
                }
            }
            this.creditCard = card;
            this.addCard = false
        }
    },

    mounted() {
      if(this.value) this.creditCard = this.value
    },

    watch: {
        reservation: {
            immediate: true,
            handler(reservation){
                if(reservation) this.getPropertyCustomer()
            }
        },

        creditCard: {
            immediate: true,
            handler(card){
                this.$emit('credit-card', card)
            }
        }
    }

}
</script>