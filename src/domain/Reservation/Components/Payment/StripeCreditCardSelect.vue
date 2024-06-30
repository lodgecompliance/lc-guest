<template>
    <data-container :loading="loading" :error="error" @retry="getPropertyCustomer">
        <confirmation-dialog ref="confirmation" @confirmed="confirmation.action()">
            {{ confirmation.text }}
        </confirmation-dialog>
        <template v-if="propertyIntegration && propertyIntegration.integration_id">
            <div v-if="source === 'card' && cards.length">
              <div class="grey--text text-center">
                <small>Your authorized card at {{ property.name }} </small>
              </div>
              <stripe-credit-card
                  v-for="(card, c) in cards"
                  :key="c"
                  class="my-1"
                  :card="card"
                  :dark="creditCard && card.id === creditCard.id"
                  :color="`${creditCard && card.id === creditCard.id ? 'primary' : ''}`"
                  @click="creditCard = card"
              >
                <template #actions="attr">
                  <v-spacer></v-spacer>
                  <v-btn icon @click="confirmCardRemoval(attr.card)">
                    <v-icon small color="red">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </stripe-credit-card>
<!--                <v-radio-group -->
<!--                    v-model="creditCard" -->
<!--                    :rules="[(v) => !v && !addCard  ? 'Select a card' : true]"-->
<!--                    :disabled="disableCardSelect"-->
<!--                    dense-->
<!--                    >-->
<!--                        <v-radio-->
<!--                            v-for="(card, c) in cards" :key="c"-->
<!--                            :value="card"-->
<!--                        >-->
<!--                            <template #label>-->
<!--                                <div class="pr-2" style="width: 100%">-->
<!--                                    <stripe-credit-card class="my-1" :card="card">-->
<!--                                        <template #actions="attr">-->
<!--                                            <v-spacer></v-spacer>-->
<!--                                            <v-btn icon @click="confirmCardRemoval(attr.card)">-->
<!--                                                <v-icon small color="red">mdi-delete</v-icon>-->
<!--                                            </v-btn>-->
<!--                                        </template>-->
<!--                                    </stripe-credit-card>-->
<!--                                </div>-->
<!--                            </template>-->
<!--                        </v-radio>-->
<!--                    </v-radio-group>-->
                <div class="text-center">
                  <a href="#" @click.prevent="addCard = true">Use another card </a>
                </div>
            </div>
            <div v-if="source === 'payment-method' && paymentMethods.length">
              <div class="grey--text text-center">
                <small>Your authorized card at {{ property.name }} </small>
              </div>

              <stripe-payment-method
                  v-for="(method, m) in paymentMethods"
                  :key="m"
                  class="my-1"
                  :dark="paymentMethod && method.id === paymentMethod.id"
                  :color="`${paymentMethod && method.id === paymentMethod.id ? 'primary' : ''}`"
                  :method="method"
                  @click="paymentMethod = method"
              >
                <template #actions="{ method }">
                  <v-spacer></v-spacer>
                  <v-btn icon @click="confirmPaymentMethodRemoval(method)">
                    <v-icon small color="red">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </stripe-payment-method>

<!--              <v-radio-group-->
<!--                  v-model="paymentMethod"-->
<!--                  :rules="[(v) => !v ? 'Select a card' : true]"-->
<!--                  >-->
<!--                      <v-radio-->
<!--                          v-for="(method, m) in paymentMethods"-->
<!--                          :key="m"-->
<!--                          :value="method"-->
<!--                      >-->
<!--                          <template #label>-->
<!--                              <div class="pr-2" style="width: 100%">-->
<!--                                  <stripe-payment-method-->
<!--                                      class="my-1"-->
<!--                                      :method="method"-->
<!--                                  >-->
<!--                                      <template #actions="{ method }">-->
<!--                                          <v-spacer></v-spacer>-->
<!--                                          <v-btn icon @click="confirmPaymentMethodRemoval(method)">-->
<!--                                              <v-icon small color="red">mdi-delete</v-icon>-->
<!--                                          </v-btn>-->
<!--                                      </template>-->
<!--                                  </stripe-payment-method>-->
<!--                              </div>-->
<!--                          </template>-->
<!--                      </v-radio>-->
<!--                  </v-radio-group>-->
              <div class="text-center">
                    <v-btn
                        text color="primary" small
                        @click.prevent="addCard = !addCard">Use another card
                    </v-btn>
                  </div>
            </div>

            <error-handler :error="error" :can-retry="false" />

            <div v-if="addCard">
                <stripe-new-credit-card
                    v-if="type === 'confirm-setup'"
                    ref="stripeCreditCard" 
                    :publishable-key="stripePublishableKey" 
                    :stripe-account="customer.stripe_account"
                    :type="type"
                    :create-intent="createSetupIntent"
                    @setup-confirmed="setupIntentConfirmed"
                    @error="stripeError"
                    @abort="stripeAborted"
                >
                    <template #submit-btn-text> Submit Card </template>
                </stripe-new-credit-card>

                <stripe-new-credit-card
                    v-else-if="type === 'create-token'"
                    ref="stripeCreditCard" 
                    :publishable-key="stripePublishableKey" 
                    :stripe-account="customer.stripe_account"
                    :type="type"
                    :token-callback="addCreditCardWithToken"
                    @error="stripeError"
                    @abort="stripeAborted"
                >
                    <template #submit-btn-text>  Submit Card </template>
                </stripe-new-credit-card>
            </div>
        </template>
         <v-alert v-else
            border="left"
            colored-border
            type="error">
            {{ property.name }} can not process credit card with Stripe
        </v-alert>
    </data-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import gql from 'graphql-tag';
import DataContainer from '@/components/DataContainer.vue';
import StripeCreditCard from '@/components/Utilities/StripeCreditCard.vue';
import StripePaymentMethod from '@/components/Utilities/StripePaymentMethod.vue';
import StripeNewCreditCard from '@/components/Utilities/StripeCardGateway.vue';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog.vue'
import CREATE_PROPERTY_CUSTOMER from '@/domain/Property/Mutations/createPropertyCustomer';
import GET_PROPERTY_STRIPE_CUSTOMER from '@/domain/Property/Queries/getPropertyStripeCustomer';
import REMOVE_PROPERTY_CUSTOMER_CREDIT_CARD from '@/domain/Property/Mutations/removePropertyCustomerCreditCard';
import session from "@/domain/Reservation/Mixins/session";
import ErrorHandler from "@/components/ErrorHandler.vue";
import config from "@/config";

export default {
    name: "StripeCreditCardSelect",
    mixins: [session],
    data(){
        return {
            loading: false,
            customer: null,
            addCard: false,
            creditCard: null,
            paymentMethod: null,
            confirmation: {
                text: String,
                action: Function
            },
            error: null,
            disableCardSelect: false,
            propertyIntegration: null,
            businessIntegration: null,
        }
    },
    components: {
      ErrorHandler,
        DataContainer, ConfirmationDialog,
        StripeCreditCard, StripePaymentMethod, StripeNewCreditCard
    },

    props: {
        reservation: Object,
        property: Object,
        value: Object,
        source: String,
    },

    computed: {
        ...mapGetters(['current_user']),

        stripePublishableKey(){
            return process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
        },
        cards(){
            return this.customer && this.customer.sources  && this.customer.sources.data ? this.customer.sources.data : []
        },

        paymentMethods() {
            return this.customer && this.customer.payment_methods  && this.customer.payment_methods.data ? this.customer.payment_methods.data : []
        },

        type() {
            if(this.source === 'payment-method') return 'confirm-setup';
            return 'create-token';
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
                    stripe {
                      integration_id
                      payment {
                          always_use_3d_secure
                      }
                    }
                  }
                }
             }`,
            variables: {
              id: this.property.id
            }
          }).then(response => {
            this.propertyIntegration = response.data.getPropertyById?.integrations?.stripe;
            if(this.propertyIntegration && this.propertyIntegration.integration_id) {
              return resolve(this.propertyIntegration)
            } else {
              return reject(new Error('Gateway not enabled for property'))
            }
          })
        })
      },

      getStripeCustomer() {
          return this.getPropertyIntegration()
          .then(() => {
            return this.query({
              domain: config.apollo.account,
              query: gql`
              query getBusinessStripeCustomer($business_id: ID!, $integration_id: ID!, $user_id: ID!) {
                getBusinessStripeCustomer(business_id: $business_id, integration_id: $integration_id, user_id: $user_id) {
                  customer {
                      id
                      object
                      address {
                          city
                          country
                          line1
                          line2
                          postal_code
                          state
                      }
                      balance
                      created
                      currency
                      description
                      email
                      livemode
                      metadata {
                          key
                          value
                      }
                      name
                      phone
                  }
                  sources {
                      has_more
                      data {
                          id
                          name
                          brand
                          exp_month
                          exp_year
                          last4
                      }
                  }
                  payment_methods {
                      has_more
                      data {
                          id
                          type
                          card {
                              brand
                              exp_month
                              exp_year
                              last4
                          }
                      }
                  }
                  stripe_account
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
            this.customer = response.data.getBusinessStripeCustomer;
            return this.customer;
          })
      },

      getPropertyCustomer(){
          this.loading = true;
          this.getStripeCustomer()
          .then(customer => {
              if(customer && customer.customer) return Promise.resolve()
              else return this.createCustomer()
          })
          .then(() => {
              if(this.source === 'card') {
                if(!this.cards.length) this.addCard = true;
              }
              if(this.source === 'payment-method') {
                if(!this.paymentMethods.length) this.addCard = true;
              }
          })
          .catch(e => this.error = e)
          .finally(() => this.loading = false)
      },

      getPaymentMethod(id) {
          return new Promise((resolve, reject) => {
              this.query({
                  domain: config.apollo.account,
                  query: gql `
                      query getBusinessStripePaymentMethod($business_id: ID!, $integration_id: ID!, $payment_method_id: ID!) {
                          getBusinessStripePaymentMethod(business_id: $business_id, integration_id: $integration_id, payment_method_id: $payment_method_id) {
                              id
                              type
                              card {
                                  brand
                                  exp_month
                                  exp_year
                                  last4
                              }
                          }
                      }
                  `,
                  variables: {
                    business_id: this.property.business_id,
                    integration_id: this.propertyIntegration.integration_id,
                    payment_method_id: id
                  }
              })
              .then(response => resolve(response.data.getBusinessStripePaymentMethod))
              .catch(e => reject(e))
          })
      },

      createCustomer(){
         return new Promise((resolve, reject) => {
            const variables = {
                business_id: this.property.business_id,
                integration_id: this.propertyIntegration.integration_id,
                user_id: this.current_user.profile.id,
                description: `New customer from reservation checkin into ${this.property.name}`,
                name: [this.current_user.profile.first_name, this.current_user.profile.last_name].join(' '),
            }
            if(this.current_user.profile.email){
                variables.email = this.current_user.profile.email
            }else if(this.current_user.auth.email){
                variables.email = this.current_user.auth.email
            }
            if(this.current_user.profile.phone){
                variables.phone = this.current_user.profile.phone
            }
            this.mutate({
                domain: config.apollo.account,
                mutation: CREATE_PROPERTY_CUSTOMER,
                variables
            })
            .then(response => {
                this.customer = response.data.createBusinessStripeCustomer;
                this.createSessionActivity({
                  title: "Guest as Stripe Customer",
                  description: `Guest added as customer on property Stripe account`
                })
                return resolve(response.data.createBusinessStripeCustomer);
            })
            .catch(e => reject(e))
        })
      },

      createCardWithToken(token){
        return new Promise((resolve, reject) => {
          this.mutate({
            domain: config.apollo.account,
            mutation: gql`
              mutation addBusinessStripeCustomerCreditCard($business_id: ID!, $integration_id: ID!, $customer_id: ID!, $source: ID!){
                addBusinessStripeCustomerCreditCard(business_id: $business_id, integration_id: $integration_id, customer_id: $customer_id, source: $source){
                  id
                  name
                  brand
                  exp_month
                  exp_year
                  last4
                  customer
                }
              }
          `,
            variables: {
              business_id: this.property.business_id,
              integration_id: this.propertyIntegration.integration_id,
              customer_id: this.customer.customer.id,
              source: token.id
            }
          })
          .then(response => {
            const card = response.data.addBusinessStripeCustomerCreditCard;
            this.customer.sources.data.push(card);
            this.creditCard = card;
            this.$store.commit("SNACKBAR", {
              status: true,
              text: `Card ending with ${card.last4} added successfully`,
              color: "success"
            })
            this.addCard = false;
            this.createSessionActivity({
              title: "Payment Card Added",
              description: `Card ***${card.last4} was added via Stripe`
            })
            return resolve(card)
          })
          .catch(e => {
            this.createSessionActivity({
              title: "Failed to Add Payment Card",
              description: `Adding payment card via Stripe via Stripe`
            })
            return reject(e)
          })
        })
      },

      addCreditCardWithToken(token) {
          if(this.customer.customer) return this.createCardWithToken(token);
          return this.createCustomer().then(() =>  this.createCardWithToken());
      },

      createIntent(){
        return new Promise((resolve, reject) => {
          this.mutate({
            domain: config.apollo.account,
            mutation: gql`
                mutation createBusinessStripeCustomerSetupIntent($business_id: ID!, $integration_id: ID!, $customer_id: ID!, $description: String, $confirm: Boolean, $card: StripeCustomCardInput, $card_token: ID, $three_d_secure: String, $metadata: [MetadataInput]){
                    createBusinessStripeCustomerSetupIntent(business_id: $business_id, integration_id: $integration_id, customer_id: $customer_id, description: $description, confirm: $confirm, card: $card, card_token: $card_token, three_d_secure: $three_d_secure, metadata: $metadata){
                        id
                        status
                        client_secret
                        payment_method
                        next_action {
                            type
                        }
                    }
                }
            `,
            variables: {
              business_id: this.property.business_id,
              integration_id: this.propertyIntegration.integration_id,
              customer_id: this.customer.customer.id,
              description: 'Setup intent for user',
              confirm: false,
              three_d_secure: this.propertyIntegration?.payment?.always_use_3d_secure ? 'any' : 'automatic',
              metadata: this.convertObjectToMetaKeyValue({
                property_id: this.property.id,
                reservation_id: this.reservation.id
              })
            }
          })
          .then(response => resolve(response.data.createBusinessStripeCustomerSetupIntent))
          .catch(e => reject(e))
        })
      },

      createSetupIntent(){
          if(this.customer.customer) return this.createIntent();
          return this.createCustomer().then(() =>  this.createIntent())
      },

      setupIntentConfirmed(intent) {
          this.loading = true;
          this.getPaymentMethod(intent.payment_method)
          .then(method => {
              this.$store.commit("SNACKBAR", {
                  status: true,
                  text: `Card ending ${method.card.last4} added successfully`,
                  color: "success"
              })
              this.customer.payment_methods.data.push(method)
              this.paymentMethod = method;
              this.addCard = false;
          })
          .catch(e => this.error = e)
          .finally(() => this.loading = false )
      },

      stripeError(e){
          this.error = e
      },

      stripeAborted(card){

      },

      confirmCardRemoval(card){
          this.confirmation = {
              text: `Are you sure you want to remove the card ending ${card.last4} `,
              action: () => this.removeCreditCard(card)
          }
          this.$refs.confirmation.open();
          this.createSessionActivity({
            title: "Attempt to Remove Payment Card",
            description: `User attempted to remove payment card ***${card.last4}`
          })
      },

      removeCreditCard(card){
          this.disableCardSelect = true;
          this.mutate({
              domain: config.apollo.account,
              mutation: gql`
                mutation removeBusinessStripeCustomerCreditCard($business_id: ID!, $integration_id: ID!, $customer_id: ID!, $card_id: ID!){
                    removeBusinessStripeCustomerCreditCard(business_id: $business_id, integration_id: $integration_id, customer_id: $customer_id, card_id: $card_id)
                }
            `,
              variables: {
                  business_id: this.property.business_id,
                  integration_id: this.propertyIntegration.integration_id,
                  customer_id: this.customer.customer.id,
                  card_id: card.id
              }
          })
          .then(response => {
              if(response.data.removeBusinessStripeCustomerCreditCard){
                  const index = this.customer.sources.data.findIndex(c => c.id === card.id);
                  this.customer.sources.data.splice(index, 1);
                  if(!this.cards.length) {
                      this.creditCard = null;
                      this.addCard = true;
                  } else {
                      this.creditCard = this.cards[0];
                  }
                  this.$store.commit("SNACKBAR", {
                      status: true,
                      text: "Credit card removed",
                      color: "success"
                  })
                this.createSessionActivity({
                  title: "Payment Card Removed",
                  description: `Card ***${card.last4} was removed by user.`
                })
              }
              else{
                  this.$store.commit("SNACKBAR", {
                      status: true,
                      text: "Credit card not removed",
                      color: "error"
                  })
                  this.createSessionActivity({
                    title: "Failed to Remove Payment Card",
                    description: `Card ***${card.last4} was not able to be removed by user.`
                  })
              }
          })
          .catch(e => {
              this.$store.commit("SNACKBAR", {
                  status: true,
                  text: `Credit card not removed. ${e.message}`,
                  color: "error"
              })
              this.createSessionActivity({
                title: "Failed to Remove Payment Card",
                description: `Card ***${card.last4} was not able to be removed by user. ${e.message}`
              })
          })
          .finally(() => {
              this.disableCardSelect = false;
          })
      },

      confirmPaymentMethodRemoval(method){
          this.confirmation = {
              text: `Are you sure you want to remove the card ending ${method.card.last4} `,
              action: () => this.removePaymentMethod(method)
          }
          this.$refs.confirmation.open();
      },

      removePaymentMethod(method){
          this.mutate({
              domain: config.apollo.account,
              mutation: gql`
                  mutation removeBusinessStripeCustomerPaymentMethod($business_id: ID!, $integration_id: ID!, $customer_id: ID!, $payment_method_id: ID!){
                      removeBusinessStripeCustomerPaymentMethod(business_id: $business_id, integration_id: $integration_id, customer_id: $customer_id, payment_method_id: $payment_method_id) {
                          id
                      }
                  }
              `,
              variables: {
                business_id: this.property.business_id,
                integration_id: this.propertyIntegration.integration_id,
                customer_id: this.customer.customer.id,
                payment_method_id: method.id
              }
          })
          .then(response => {
              if(response.data.removeBusinessStripeCustomerPaymentMethod){
                  const index = this.customer.payment_methods.data.findIndex(c => c.id === method.id);
                  this.customer.payment_methods.data.splice(index, 1);
                  if(!this.paymentMethods.length) {
                      this.paymentMethod = null;
                      this.addCard = true;
                  } else {
                      this.paymentMethod = this.paymentMethods[0];
                  }
                  this.$store.commit("SNACKBAR", {
                      status: true,
                      text: "Card removed",
                      color: "success"
                  })
              }
              else{
                  this.$store.commit("SNACKBAR", {
                      status: true,
                      text: "Card not removed",
                      color: "error"
                  })
              }
          })
          .catch(e => {
              this.$store.commit("SNACKBAR", {
                  status: true,
                  text: `Card not removed. ${e.message}`,
                  color: "error"
              })
          })
      },

    },
 
    watch: {
        reservation: {
            immediate: true,
            handler(reservation){
                if(reservation) this.getPropertyCustomer()
            }
        },

        value: {
            immediate: true,
            handler(card) {
              if (this.source === 'card') this.creditCard = card;
              if (this.source === 'payment-method') this.paymentMethod = card;
            }
        },

        customer: {
            immediate: true,
            handler(customer) {
              this.setCheckinData("stripe_customer", customer);
              if(customer) this.$emit('customer', customer);
            }
        },

        creditCard: {
            immediate: true,
            handler(card){
                if(card) this.addCard = false;
                this.$emit('credit-card', { customer: this.customer?.customer?.id, card })
            }
        },

        paymentMethod: {
            immediate: true,
            handler(payment_method){
                this.$emit('credit-card', { customer: this.customer?.customer?.id, payment_method })
            }
        },

        addCard: {
            immediate: true,
            handler(addingCard){
                if(addingCard) {
                    this.creditCard = null;
                }
            }
        },

      cards: {
          immediate: true,
          handler(cards) {
            if(this.creditCard && !(cards || []).map(c => c.id).includes(this.creditCard.id)) {
              this.creditCard = null;
            }
          }
      },

      paymentMethods: {
        immediate: true,
        handler(methods) {
          if(this.paymentMethod && !(methods || []).map(m => m.id).includes(this.paymentMethod.id)) {
            this.paymentMethod = null;
          }
        }
      }
    }

}
</script>