<template>
    <data-container :loading="loading">
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
import { mapActions } from 'vuex';
import gql from 'graphql-tag';

import DataContainer from '@/components/DataContainer.vue';
import PaystackCreditCard from '@/components/Utilities/PaystackCreditCard.vue';
import PaystackNewCreditCard from '@/components/Utilities/PaystackNewCreditCard.vue';

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

        cards(){
            return this.customer && this.customer.authorizations ? this.customer.authorizations : []
        }
    },

    methods: {
        ...mapActions([
            'query', 'mutate'
        ]),

        getPropertyCustomer(){
            if(!(this.property?.integrations || []).includes('paystack')) {
                this.error = `${this.property.name} can not process this transaction at the moment`;
                return;
            }
            this.loading = true;
            this.query({
                query: gql `
                    query getPropertyPaystackCustomer($property_id: ID!, $user_id: ID) {
                        getPropertyPaystackCustomer(property_id: $property_id, user_id: $user_id) {
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
                    property_id: this.property.id,
                }
            })
            .then(response => {
                this.customer = response.data.getPropertyPaystackCustomer;
                this.$emit('customer-fetched', this.customer)

                if(!this.cards.length) this.addCard = true;
                else this.creditCard = this.cards[0];

            })
            .catch(e => {
                this.error = `Could not get credit cards. ${e.message}`
            })
            .finally(() => {
                this.loading = false
            })
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