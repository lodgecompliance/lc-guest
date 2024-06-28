<template>
    <div>
      <slot v-bind="{ startPayment, loading }">
        <v-btn color="primary" text @click="startPayment" :loading="loading">
          Make Payment
        </v-btn>
      </slot>
      <v-dialog v-model="dialog" width="350" scrollable>
        <v-card :loading="loading">
          <v-card-title>
            <h4>{{ payload.capture ? 'Pay' : 'Authorize' }} {{ total | money(charge.currency) }}</h4>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <stripe-credit-card-select
                ref="creditCards"
                :property="property"
                :reservation="reservation"
                :source="sourceFrom"
                :value="availableSource"
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
    </div>
</template>

<script>
import gql from 'graphql-tag';
import StripeCreditCardSelect from './StripeCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";
import stripe from "@/mixins/stripe";

export default {
    name: "ReservationStripeSinglePayment",
    mixins: [stripe, session],
    components: {
        StripeCreditCardSelect
    },
    data() {
        return {
            dialog: false,
            loading: false,
            customer: null,
            source: null,
            error: null,
            intent: null,
            payment: null,
        }
    },
    props: {
        property: Object,
        reservation: Object,
        charge: Object,
        total: Number,
        payload: Object,
        availableSource: Object,
        sourceFrom: {
          type: String,
          default: () => "payment-method"
        }
    },

  computed: {
    stripePublishableKey(){
      return process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY
    },
    cardDetails() {
      if(this.sourceFrom === "payment-method") return this.source.card;
      else if(this.sourceFrom === "card") return this.source;
      return null;
    },
    customerInfo() {
      return this.customer?.customer
    }
  },
  methods: {
    startPayment() {
      if(this.availableSource) this.completePayment();
      else this.dialog = true;
    },
    customerReceived(customer) {
        this.customer = customer;
        this.setStripe(this.stripePublishableKey, this.customer?.stripe_account);
    },
    creditCardSelected(card) {
        this.source = null;
        if(this.sourceFrom === "payment-method") this.source = card.payment_method;
        else if(this.sourceFrom === "card") this.source = card.card;
        this.$emit('credit-card', card)
    },
    completePayment() {
        if(this.sourceFrom === 'card') this.stripePaymentViaCharge()
        if(this.sourceFrom === 'payment-method') this.stripePaymentViaIntent()
    },
    createCharge() {
        return new Promise((resolve, reject) => {
          this.$store.dispatch('mutate', {
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
            variables: {
              ...this.payload,
              source: this.source.id,
              customer: this.customerInfo?.id
            }
          }).then(response => {
            this.payment = response.data.createReservationCharge;
            resolve(response.data.createReservationCharge)
          }).catch(e => reject(e));
        })
      },
    createIntent() {
      return new Promise((resolve, reject) => {
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
          variables: {
            ...this.payload,
            source: this.source.id,
            customer: this.customerInfo.id
          }
        }).then(response => {
          this.intent = response.data.createReservationPaymentIntent;
          resolve(response.data.createReservationPaymentIntent);
        }).catch(e => reject(e));
      })
    },
    getPaymentFromIntent() {
      return new Promise((resolve, reject) => {
        return this.$store.dispatch('query', {
          query: gql`
              query getReservationPaymentFromIntent($property_id: ID!, $intent_id: ID!){
                getReservationPaymentFromIntent(property_id: $property_id, intent_id: $intent_id) {
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
          variables: {
            intent_id: this.intent.id,
            property_id: this.property.id,
          }
        }).then(response => {
          this.payment = response.data.getReservationPaymentFromIntent
          resolve(response.data.getReservationPaymentFromIntent)
        }).catch(e => reject(e));
      })
    },
    stripePaymentViaCharge() {
          this.error = null;
          this.loading = true;
          this.createSessionActivity({
            title: `Payment Attempt via Stripe: ${this.charge.title}`,
            description: `Attempting to make payment via Stripe with card ***${this.cardDetails?.last4}`
          })
          this.createCharge()
          .then(charge => {
            this.$emit('transaction', charge);
            this.$store.commit('SNACKBAR', {
              status: true,
              color: 'success',
              text: `Payment successful`
            })
            this.createSessionActivity({
              title: `Payment via Stripe: ${this.charge.title}: ${charge.status}`,
              description: `Payment of ${charge.currency} ${charge.amount/100} (${charge.id}) was made via Stripe with card ***${charge.source?.last4}`
            })
          })
          .catch(e => {
            this.error = `Payment was not completed. ${e.message}`;
            this.createSessionActivity({
              title: `Failed Payment via Stripe: ${this.charge.title}:`,
              description: `Payment via Stripe failed: ${e.message}`
            })
          })
          .finally(() => {
            this.loading = false;
          });
      },
    stripePaymentViaIntent() {
          this.error = null;
          this.loading = true;
          this.createSessionActivity({
            title: `Payment Attempt via Stripe: ${this.charge.title}`,
            description: `Attempting to make payment via Stripe Payment Intent with card ***${this.cardDetails?.last4}`
          })
          this.createIntent()
          .then(intent => {
            this.createSessionActivity({
              title: `Payment via Stripe: ${this.charge.title}`,
              description: `Payment intent created with status ${intent.status}`
            })
            if(intent.status === "requires_action") {
              this.createSessionActivity({
                title: `Payment via Stripe: ${this.charge.title}`,
                description: `Payment requires action ${intent.next_action?.type}. Confirming payment with Stripe SDK`
              })
              return this.confirmPaymentWithSDK(intent, this.source.id);
            } else return Promise.resolve({ paymentIntent: intent });
          })
          .then(result => {
            if(result.error) {
              this.createSessionActivity({
                title: `Payment via Stripe: ${this.charge.title}`,
                description: `Payment could not be confirmed: ${result.error?.message}`
              })
              throw new Error(result.error.message);
            }
            this.intent = result.paymentIntent;
            this.createSessionActivity({
              title: `Payment via Stripe: ${this.charge.title}`,
              description: `Confirming payment from Stripe..`
            })
            return this.getPaymentFromIntent()
          })
          .then(payment => {
            this.createSessionActivity({
              title: `Payment via Stripe: ${this.charge.title}`,
              description: `Payment confirmed with status ${payment.status}`
            })
            if(payment.status === "succeeded") {
              this.$emit('transaction', payment);
              this.$store.commit('SNACKBAR', {
                status: true,
                color: 'success',
                text: payment.captured ? `Payments successful` : `Payment authorized`
              })
              this.dialog = false;
            } else throw new Error("Payment status is "+payment.status)
          })
          .catch(e => {
            this.error = e;
            this.dialog = true;
            this.createSessionActivity({
              title: `Payment via Stripe: ${this.charge.title}`,
              description: `Failed payment: ${e.message}`
            })
          })
          .finally(() => {
              this.loading = false;
          });
      }
  },
  mounted() {
     const customer = this.getCheckinData("stripe_customer");
     if(customer) this.customerReceived(customer);
  },
  watch: {
    availableSource: {
      immediate: true,
      handler(source) {
        if(source) this.source = source
      }
    }
  }
}
</script>