<template>
    <data-container :loading="loading">
        <confirmation-dialog ref="confirmation" @confirmed="confirmation.action()">
            {{ confirmation.text }}
        </confirmation-dialog>
        <template v-if="property.stripe_connected">
            <div v-if="source === 'card' && cards.length">
              <div class="grey--text text-center">
                <small>Your authorized card at {{ property.name }} </small>
              </div>
                <v-radio-group 
                    v-model="creditCard" 
                    :rules="[(value) => !value && !addCard  ? 'Select a credit card' : true]"
                    :disabled="disableCardSelect"
                    dense
                    >
                        <v-radio
                            v-for="(card, c) in cards" :key="c"
                            :value="card"
                        >
                            <template #label>
                                <div class="pr-2" style="width: 100%">
                                    <stripe-credit-card class="my-1" :card="card">
                                        <template #actions="attr">
                                            <v-spacer></v-spacer>
                                            <v-btn icon @click="confirmCardRemoval(attr.card)">
                                                <v-icon small color="red">mdi-delete</v-icon>
                                            </v-btn>
                                        </template>
                                    </stripe-credit-card>
                                </div>
                            </template>
                        </v-radio>
                    </v-radio-group>
                <div class="text-center">
                  <a href="#" @click.prevent="addCard = true">Use another card </a>
                </div>
            </div>
            <div v-if="source === 'payment-method' && paymentMethods.length">
              <div class="grey--text text-center">
                <small>Your authorized card at {{ property.name }} </small>
              </div>
              <v-radio-group
                  v-model="paymentMethod"
                  :rules="[(value) => !value ? 'Select a credit card' : true]"
                  >
                      <v-radio
                          v-for="(method, m) in paymentMethods" :key="m"
                          :value="method"
                      >
                          <template #label>
                              <div class="pr-2" style="width: 100%">
                                  <stripe-payment-method class="my-1" :method="method" >
                                      <template #actions="attr">
                                          <v-spacer></v-spacer>
                                          <v-btn icon @click="confirmPaymentMethodRemoval(attr.method)">
                                              <v-icon small color="red">mdi-delete</v-icon>
                                          </v-btn>
                                      </template>
                                  </stripe-payment-method>
                              </div>
                          </template>
                      </v-radio>
                  </v-radio-group>
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
import { mapActions } from 'vuex';
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

        getPropertyStripeCustomer() {
          const customer = this.getCheckinData("stripe_customer")
          if(customer) return Promise.resolve(customer);
          return new Promise((resolve, reject) => {
            this.query({
              query: GET_PROPERTY_STRIPE_CUSTOMER,
              variables: {
                property_id: this.reservation.property_id,
              }
            })
            .then(response => {
              this.customer = response.data.getPropertyStripeCustomer;
              resolve(response.data.getPropertyStripeCustomer)
            }).catch(e => reject(e))
          })
        },

        getPropertyCustomer(){
            if(!this.property.stripe_connected) return;
            this.loading = true;
            this.getPropertyStripeCustomer()
            .then(customer => {
                if(customer && customer.customer) return Promise.resolve()
                else return this.createCustomer()
            })
            .then(() => {
                if(this.source === 'card') {
                    if(!this.cards.length) this.addCard = true;
                    else this.creditCard = this.cards[this.cards.length - 1];
                }
                if(this.source === 'payment-method') {
                    if(!this.paymentMethods.length) this.addCard = true;
                    else this.paymentMethod = this.paymentMethods[this.paymentMethods.length - 1];
                }
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false
            })
        },

        getPropertyCustomerPaymentMethod(id) {
            return new Promise((resolve, reject) => {
                this.query({
                    query: gql `
                        query getPropertyStripePaymentMethod($property_id: ID!, $payment_method_id: ID!) {
                            getPropertyStripePaymentMethod(property_id: $property_id, payment_method_id: $payment_method_id) {
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
                        property_id: this.property.id,
                        payment_method_id: id
                    }
                })
                .then(response => {
                    resolve(response.data.getPropertyStripePaymentMethod);
                })
                .catch(e => reject(e))
            })
        },

        createCustomer(){
             return new Promise((resolve, reject) => {
                const variables = {
                    property_id: this.reservation.property_id,
                    user_id: this.$store.getters.current_user.profile.id,
                    description: `New customer from reservation checkin into ${this.property.name}`,
                    name: [this.$store.getters.current_user.profile.first_name, this.$store.getters.current_user.profile.last_name].join(' '),
                }

                if(this.$store.getters.current_user.profile.email){
                    variables.email = this.$store.getters.current_user.profile.email
                }else if(this.$store.getters.current_user.auth.email){
                    variables.email = this.$store.getters.current_user.auth.email
                }

                if(this.$store.getters.current_user.profile.phone){
                    variables.phone = this.$store.getters.current_user.profile.phone
                }

                this.mutate({
                    mutation: CREATE_PROPERTY_CUSTOMER,
                    variables
                })
                .then(response => {
                    this.customer = response.data.createPropertyCustomer;
                    this.createSessionActivity({
                      title: "Guest as Stripe Customer",
                      description: `Guest added as customer on property Stripe account`
                    })
                    return resolve(response.data.createPropertyCustomer);
                })
                .catch(e => {
                    reject(e)
                })
            })
        },

        addCreditCardWithToken(token) {
            const createCard = () => {
                return new Promise((resolve, reject) => {
                    this.mutate({
                        mutation: gql`
                            mutation addPropertyCustomerCreditCard($property_id: ID!, $customer_id: ID!, $source: ID!){
                                addPropertyCustomerCreditCard(property_id: $property_id, customer_id: $customer_id, source: $source){
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
                            property_id: this.property.id,
                            customer_id: this.customer.customer.id,
                            source: token.id
                        }
                    })
                    .then(response => {
                        const card = response.data.addPropertyCustomerCreditCard;
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
            }
            if(this.customer.customer) return createCard();
            return this.createCustomer().then(() =>  createCard());
        },

        createPaymentIntentForCard(card){
            const createIntent = () => {
                return new Promise((resolve, reject) => {
                    this.mutate({
                        mutation: gql`
                            mutation createPropertyCustomerPaymentIntentForCard($property_id: ID!, $customer_id: ID!, $amount: Int, $currency: String, $description: String, $card: StripeCustomCardInput){
                                createPropertyCustomerPaymentIntentForCard(property_id: $property_id, customer_id: $customer_id, amount: $amount, currency: $currency, description: $description, card: $card){
                                    id
                                    amount
                                    currency
                                    status
                                    client_secret
                                    next_action {
                                        type
                                    }
                                }
                            }
                        `,
                        variables: {
                            property_id: this.property.id,
                            customer_id: this.customer.customer.id,
                            amount: 50,
                            currency: 'USD',
                            description: 'Deposit to add new credit card',
                            card: card ? card.id : null
                        }
                    })
                    .then(response => {
                        const intent = response.data.createPropertyCustomerPaymentIntentForCard;
                        resolve(intent)
                    })
                    .catch(e => {
                        reject(e)
                    })
                })
            }
            if(this.customer.customer) return createIntent();
            return this.createCustomer().then(() =>  createIntent())
        },

        createSetupIntent(){
            const createIntent = () => {
                return new Promise((resolve, reject) => {
                    this.mutate({
                        mutation: gql`
                            mutation createPropertyCustomerSetupIntent($property_id: ID!, $customer_id: ID!, $description: String, $confirm: Boolean, $card: StripeCustomCardInput, $card_token: ID){
                                createPropertyCustomerSetupIntent(property_id: $property_id, customer_id: $customer_id, description: $description, confirm: $confirm, card: $card, card_token: $card_token){
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
                            property_id: this.property.id,
                            customer_id: this.customer.customer.id,
                            description: 'Setup intent for user',
                            confirm: false
                        }
                    })
                    .then(response => {
                        const intent = response.data.createPropertyCustomerSetupIntent;
                        resolve(intent)
                    })
                    .catch(e => {
                        reject(e)
                    })
                })
            }
            if(this.customer.customer) return createIntent();
            return this.createCustomer().then(() =>  createIntent())
        },

        setupIntentConfirmed(intent) {
            this.loading = true;
            this.getPropertyCustomerPaymentMethod(intent.payment_method)
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
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        stripeError(e){
            this.error = e
        },

        stripeAborted(card){
            
        },

        confirmCardRemoval(card){
            this.confirmation = {
                text: `Are you sure you want to remove the card ending ${card.last4} `,
                action: () => {
                    this.removeCreditCard(card)
                }
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
                mutation: REMOVE_PROPERTY_CUSTOMER_CREDIT_CARD,
                variables: {
                    property_id: this.property.id,
                    customer_id: this.customer.customer.id,
                    card_id: card.id
                }
            })
            .then(response => {
                if(response.data.removePropertyCustomerCreditCard == true){
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
                action: () => {
                    this.removePaymentMethod(method)
                }
            }
            this.$refs.confirmation.open();
        },

        removePaymentMethod(method){
            this.mutate({
                mutation: gql`
                    mutation removePropertyCustomerPaymentMethod($property_id: ID!, $customer_id: ID!, $payment_method_id: ID!){
                        removePropertyCustomerPaymentMethod(property_id: $property_id, customer_id: $customer_id, payment_method_id: $payment_method_id) {
                            id
                        }
                    }
                `,
                variables: {
                    property_id: this.property.id,
                    customer_id: this.customer.customer.id,
                    payment_method_id: method.id
                }
            })
            .then(response => {
                if(response.data.removePropertyCustomerPaymentMethod){
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

    mounted() {
      if (this.value) {
        if (this.source === 'card') this.creditCard = this.value;
        if (this.source === 'payment-method') this.paymentMethod = this.value;
      }
    },
 
    watch: {
        reservation: {
            immediate: true,
            handler(reservation){
                if(reservation) this.getPropertyCustomer()
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
        }
    }

}
</script>