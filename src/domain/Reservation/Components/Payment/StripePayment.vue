<template>
    <v-dialog v-model="pay" width="350" scrollable>
      <template #activator="{ on }">
        <slot v-bind="{ on }">
          <v-btn color="primary" text v-on="on">
            Make Payment
          </v-btn>
        </slot>
      </template>
      <v-card :loading="loading">
        <v-card-title>
          <h4>Pay {{ total | money(currency) }}</h4>
          <v-spacer></v-spacer>
          <v-btn icon @click="pay = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <stripe-credit-card-select
              ref="creditCards"
              :property="property"
              :reservation="reservation"
              :source="paymentSource"
              @customer="customerReceived"
              @credit-card="creditCardSelected"
          />
          <v-alert v-if="error"
                   border="left"
                   colored-border
                   type="error"
                   class="my-2"
          >
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions v-if="source">
          <v-btn
                 color="primary"
                 @click="completePayment"
                  block depressed
                 :loading="loading"
          >Complete payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import gql from 'graphql-tag';
import StripeCreditCardSelect from './StripeCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";
import stripe from "@/mixins/stripe";

export default {
    name: "ReservationStripePayment",
    mixins: [stripe, session],
    components: {
        StripeCreditCardSelect
    },
    data() {
        return {
            pay: false,
            loading: false,
            customer: null,
            source: null,
            error: null,
            paymentSource: 'payment-method'
        }
    },
    props: {
        property: Object,
        reservation: Object,
        charges: Array,
        total: Number,
        currency: String
    },

  computed: {
    totalPaying() {
      return this.charges.reduce((a,b) => a+b, 0)
    },
    stripePublishableKey(){
      return process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
    }
  },

    methods: {

        customerReceived(customer) {
            this.customer = customer?.customer;
            this.initializeStripeSDK(this.stripePublishableKey, customer?.stripe_account);
        },

        creditCardSelected(card) {
            this.source = null;
            if(this.paymentSource === "payment-method") this.source = card.payment_method;
            else if(this.paymentSource === "card") this.source = card.card;
            this.$emit('credit-card', card)
        },

        completePayment() {
            if(this.paymentSource === 'card') this.stripePayment()
            if(this.paymentSource === 'payment-method') this.stripePaymentIntents()
        },

        stripePayment() {
            this.error = null;
            this.loading = true;

            const setChargeVariable = (charge) => {
                return {
                        ...charge,
                        source: this.source.id,
                        customer: this.customer.id,
                        // metadata: {
                        //     ...charge.metadata,
                        //     multipliers: charge.metadata.multipliers ? charge.metadata.multipliers.map(m => {
                        //         return { ...m }
                        //     }) : []
                        // }
                    }
            }

            const payments = () => {
                return this.charges.map(charge => {
                    return this.$store.dispatch('mutate', {
                        mutation: gql`
                            mutation createReservationCharge($property_id: ID!, $source: String!, $customer: ID, $amount: Int!, $currency: String!, $description: String, $receipt_email: String, $metadata: ReservationPaymentMetadataInput, $capture: Boolean){
                                createReservationCharge(property_id: $property_id, source: $source, customer: $customer, amount: $amount, currency: $currency, description: $description, receipt_email: $receipt_email, metadata: $metadata, capture: $capture) {
                                    id
                                    description
                                    currency
                                    amount
                                    status
                                    metadata {
                                        user_id
                                        reservation_id
                                        charge_id
                                        property_id
                                        base_multiplier {
                                            unit
                                            quantity
                                        }
                                        custom_multipliers {
                                            unit
                                            quantity
                                        }
                                        refundable
                                    }
                                    captured
                                    refunded
                                    amount_captured
                                    amount_refunded
                                    receipt_url
                                    net_captured
                                    source {
                                        id
                                        name
                                        brand
                                        exp_month
                                        exp_year
                                        last4
                                        customer
                                    }
                                }
                        }`,
                        variables: setChargeVariable(charge)
                    });
                });
            }

            this.createSessionActivity({
              title: `Payment Attempt via Stripe`,
              description: `Attempting to make payment via Stripe with card ***${this.source?.last4}`
            })

            Promise.all(payments()).then(paymentsResponse => {
                const payments = paymentsResponse.map(response => response.data.createReservationCharge)
                                .filter(payment => payment !== null);

                this.$store.commit('SNACKBAR', {
                    status: true,
                    color: 'success',
                    text: `Payment successful`
                })

                this.$emit('transactions', payments);
                this.pay = false;

                payments.forEach(async transaction => {
                  await this.createSessionActivity({
                    title: `Payment via Stripe: ${transaction.status}`,
                    description: `Payment of ${transaction.currency} ${transaction.amount/100} (${transaction.id}) was made via Stripe with card ***${transaction.source?.last4}`
                  })
                })

            })
            .catch(e => {
                this.error = `Payment was not completed. ${e.message}`;
                this.createSessionActivity({
                  title: `Failed Payment via Stripe`,
                  description: `Payment via Stripe failed: ${e.message}`
                })
            })
            .finally(() => {
                this.loading = false;
            });
        },

        stripePaymentIntents() {
            this.error = null;
            this.loading = true;

            const setChargeVariable = (charge) => {
                return {
                        ...charge,
                        source: this.source.id,
                        customer: this.customer.id,
                        // metadata: {
                        //     ...charge.metadata,
                        //     multipliers: charge.metadata.multipliers ? charge.metadata.multipliers.map(m => {
                        //         return { ...m }
                        //     }) : []
                        // }
                    }
            }

            const intents = () => {
                return this.charges.map(charge => {
                    return this.$store.dispatch('mutate', {
                        mutation: gql`
                            mutation createReservationPaymentIntent($property_id: ID!, $source: String!, $customer: ID, $amount: Int!, $currency: String!, $description: String, $receipt_email: String, $metadata: ReservationPaymentMetadataInput, $capture: Boolean){
                                createReservationPaymentIntent(property_id: $property_id, source: $source, customer: $customer, amount: $amount, currency: $currency, description: $description, receipt_email: $receipt_email, metadata: $metadata, capture: $capture) {
                                    id
                                    client_secret
                                    description
                                    currency
                                    amount
                                    status
                                    metadata {
                                        user_id
                                        reservation_id
                                        charge_id
                                        property_id
                                        base_multiplier {
                                            unit
                                            quantity
                                        }
                                        custom_multipliers {
                                            unit
                                            quantity
                                        }
                                    }
                                    next_action {
                                        type
                                    }
                                }
                        }`,
                        variables: setChargeVariable(charge)
                    });
                });
            }

            Promise.all(intents()).then(paymentsResponse => {
                return Promise.all(paymentsResponse
                    .map(response => response.data.createReservationPaymentIntent)
                    .filter(payment => payment !== null)
                    .map(payment => {
                      console.log(payment, this.source.id)
                      if(payment.status === "succeeded") return Promise.resolve({ paymentIntent: payment });
                      else if(payment.status === "requires_action") {
                        return this.confirmPaymentWithSDK(payment, this.source.id);
                      }
                    }))
            })
            .then(payments => {
              this.$store.commit('SNACKBAR', {
                status: true,
                color: 'success',
                text: `Payments successful`
              })
              //this.$emit('transactions', payments)
            })
            .catch(e => {
                this.error = `Payment was not completed. ${e.message}`
            })
            .finally(() => {
                this.loading = false;
            });
        }

    }

}
</script>