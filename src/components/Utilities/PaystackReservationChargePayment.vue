<template>
<div>
    <v-form ref="form">
      <v-text-field v-if="!availableEmail"
          dense outlined
          v-model="email"
          type="email"
          label="Enter a valid email"
          :rules="[(v)=> !v ? 'Enter a valid email' : true]" />
      <v-btn
         v-bind="$attrs.btn"
         color="primary"
         @click="initializeTransaction" :loading="computing || verifying">
        <slot>Make Payment</slot>
      </v-btn>
    </v-form>
    <v-alert v-if="verifying"
    border="left"
    colored-border
    type="info"
    class="my-2"
    >
        Verifying transaction..
    </v-alert>
    <error-handler :error="error" @retry="initializeTransaction" />
    <error-handler :error="verificationError" :can-retry="false" />
    <paystack-payment-gateway
    :setup="setup"
    ref="paystackPayment"
    @callback="paystackVerification"
    />
</div>
    
</template>

<script>
import gql from 'graphql-tag';
import PaystackPaymentGateway from '@/components/Utilities/PaystackPaymentGateway.vue'
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationPaystackPayment",
    components: {
      ErrorHandler,
      PaystackPaymentGateway
    },
    data() {
        return {
            setup: null,
            computing: false,
            verifying: false,
            verificationError: null,
            error: null,
            email: null,
        }
    },
    props: {
        property: Object,
        reservation: Object,
        charges: Array,
    },
  computed: {
      availableEmail(){
        if(this.charges.length && this.charges.some(c => c.receipt_email != null)) {
          return this.charges.find(c => c.receipt_email != null).receipt_email
        }
        return null;
      }
  },

  methods: {
      initializeTransaction() {
        if(this.$refs.form && !this.$refs.form.validate()) {
          this.error = new Error("Provide a valid email address");
          return;
        }
        this.error= null;
        this.computing = true;
        this.$store.dispatch('mutate', {
            mutation: gql `
                mutation computeReservationPaystackPaymentIntent($property_id: ID!, $charges: [ReservationPaystackPaymentChargeInput!]!, $currency: String!, $email: String!) {
                    computeReservationPaystackPaymentIntent(property_id: $property_id, charges: $charges, currency: $currency, email: $email) {
                        key
                        amount
                        currency
                        email
                        metadata {
                            user_id
                            property_id
                            charges
                        }
                    }
                }
            `,
            variables: {
                property_id: this.property.id,
                currency: this.reservation.currency,
                email: this.email ? this.email : this.availableEmail,
                charges: this.charges
            }
        })
        .then(response => {
            this.setup = response.data.computeReservationPaystackPaymentIntent;
            this.$refs.paystackPayment.pay();
        })
        .catch(e => this.error = e )
        .finally(() => this.computing = false)
      },

      paystackVerification({ reference }) {
        this.verifying = true;
        this.verificationError = null;
        this.$store.dispatch('mutate', {
              mutation: gql `
                  mutation verifyReservationPaystackTransaction($reservation_id: ID!, $reference: ID!) {
                      verifyReservationPaystackTransaction(reservation_id: $reservation_id, reference: $reference) {
                          status
                          message
                          data {
                              amount
                              currency
                              transaction_date
                              status
                              reference
                              domain
                              amount
                              currency
                              reference
                              status
                              metadata {
                                  user_id
                                  property_id
                              }
                              charges {
                                  property_id
                                  amount
                                  currency
                                  description
                                  receipt_email
                                  capture
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
                              }
                              authorization {
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
                  }
              `,
              variables: {
                  reference,
                  reservation_id: this.reservation.id,
              }
          }).then(response => {
              const transaction = response.data.verifyReservationPaystackTransaction;
              if(transaction && transaction.status) {
                  this.$emit('transaction', transaction.data)
              }
          })
          .catch(e => {
              this.verificationError =  e
          })
          .finally(() => {
              this.verifying = false;
          })
      }

  },
  mounted() {
      if(this.$store.getters.current_user.profile.email ) {
        this.email = this.$store.getters.current_user.profile.email
      } else if(this.$store.getters.current_user.auth.email) {
        this.email = this.$store.getters.current_user.auth.email
      }
  }

}
</script>