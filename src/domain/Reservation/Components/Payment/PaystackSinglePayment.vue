<template>
  <div>
    <slot v-bind="{ startPayment, loading: chargingAuthorization || verifyingTransaction }">
      <v-btn color="primary" text @click="startPayment" :loading="chargingAuthorization || verifyingTransaction">
        Make Payment
      </v-btn>
    </slot>
    <v-dialog v-model="dialog" width="350" scrollable>
      <v-card :loading="chargingAuthorization">
        <v-card-title>
          <h4>Pay {{ total | money(currency) }}</h4>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <paystack-credit-card-select
              :property="property"
              :reservation="reservation"
              :can-create-new="true"
              :value="availableAuthorization"
              @customer-fetched="paystackCustomerFetched"
              @credit-card="creditCardSelected"
          />
          <error-handler :error="error" />
          <v-alert v-if="verifyingTransaction"
                   border="left"
                   colored-border
                   type="info"
                   class="my-2"
          >
            Verifying transaction..
          </v-alert>
        </v-card-text>
        <v-card-actions v-if="creditCard">
          <v-btn
              color="primary"
              @click="chargeAuthorization"
              block depressed
              :loading="chargingAuthorization"
          >Complete payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import PaystackCreditCardSelect from './PaystackCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";
import ErrorHandler from "@/components/ErrorHandler.vue";
export default {
    name: "ReservationPaystackSinglePayment",
    mixins: [session],
    components: {
      ErrorHandler,
        PaystackCreditCardSelect
    },
    props: {
        property: Object,
        reservation: Object,
        charge: Object,
        payload: Object,
        total: Number,
        currency: String,
        availableAuthorization: Object
    },
    data() {
        return {
            dialog: false,
            creditCard: null,
            customer: null,
            error: null,
            chargingAuthorization: false,
            verifyingTransaction: false,
        }
    },
    computed: {
      receiptEmail(){
        if(this.charges.length && this.charges.some(c => c.receipt_email != null)) {
          return this.charges.find(c => c.receipt_email != null).receipt_email
        } else if(this.customer) {
          return this.customer.email
        }
        return null;
      }
    },
    methods: {
        startPayment() {
          if(this.availableAuthorization) this.chargeAuthorization();
          else this.dialog = true;
        },
        paystackCustomerFetched(customer) {
            this.customer = customer;
        },
        creditCardSelected(card) {
            this.creditCard = card;
            this.$emit('credit-card', card)
        },
        cA() {
          return new Promise((resolve, reject) => {
            this.$store.dispatch('mutate', {
              mutation: gql `
                mutation chargeReservationPaystackAuthorization($property_id: ID!, $reservation_id: ID!, $authorization_code: ID!,  $charge: ReservationPaystackPaymentChargeInput!) {
                    chargeReservationPaystackAuthorization(property_id: $property_id, reservation_id: $reservation_id, authorization_code: $authorization_code, charge: $charge) {
                        status
                        message
                        data {
                            reference
                        }
                    }
                }
            `,
              variables: {
                property_id: this.property.id,
                reservation_id: this.reservation.id,
                authorization_code: this.creditCard.authorization_code,
                charge: this.payload
              }
            }).then(response => {
              resolve(response.data.chargeReservationPaystackAuthorization)
            }).catch(e => reject(e))
          })
        },
        vA(charge) {
          return new Promise((resolve, reject) => {
            this.$store.dispatch('mutate', {
              mutation: gql `
                mutation  verifyReservationPaystackTransaction($property_id: ID!, $reservation_id: ID!, $reference: ID!) {
                    verifyReservationPaystackTransaction(property_id: $property_id, reservation_id: $reservation_id, reference: $reference) {
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
                reference: charge.data.reference,
                property_id: this.property.id,
                reservation_id: this.reservation.id,
              }
            }).then(response => {
              resolve(response.data.verifyReservationPaystackTransaction)
            }).catch(e => reject(e))
          })
        },
        chargeAuthorization() {
            this.error = null;
            this.chargingAuthorization = true;
            this.createSessionActivity({
              title: `Payment Attempt via Paystack: ${this.charge.title}`,
              description: `Attempting to make payment via Paystack with card ***${this.creditCard?.last4}`
            })
           this.cA()
          .then(charge => {
            this.verifyingTransaction = true;
            return this.vA(charge);
          })
          .then(transaction => {
            transaction = transaction.data;
            this.$store.commit('SNACKBAR', {
              status: true,
              color: 'success',
              text: `${this.reservation.currency.toUpperCase()}${transaction.amount/100} paid`
            });
            this.$emit('transaction', transaction);
            this.dialog = false;
            this.createSessionActivity({
              title: `Payment via Paystack: ${this.charge.title}: ${transaction.status}`,
              description: `Payment of ${transaction.currency} ${transaction.amount} (${transaction.reference}) was made via Paystack with card  ***${transaction.authorization?.last4}`
            })
          })
          .catch(e => {
            this.error = e;
            this.dialog = true;
            this.createSessionActivity({
              title: `Failed Payment via Paystack: ${this.charge.title}`,
              description: `Payment via Paystack failed: ${e.message}`
            })
          })
          .finally(() => {
            this.chargingAuthorization = false;
            this.verifyingTransaction = false;
          })
        },
    },
    watch: {
      availableAuthorization: {
        immediate: true,
        handler(auth) {
          if(auth) this.creditCard = auth
        }
      }
    }
}
</script>