<template>
    <v-dialog v-model="pay" width="350" scrollable>
      <template #activator="{ on }">
        <slot v-bind="{ on }">
          <v-btn color="primary" text >
            <slot>Make Payment</slot>
          </v-btn>
        </slot>
      </template>
        <v-card :loading="chargingAuthorization">
          <v-card-title>
            <h4>Pay {{ total | money(currency) }}</h4>
            <v-spacer></v-spacer>
            <v-btn icon @click="pay = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <paystack-credit-card-select
                :property="property"
                :reservation="reservation"
                :can-create-new="false"
                @customer-fetched="paystackCustomerFetched"
                @credit-card="creditCardSelected"
            />
            <error-handler :error="error" @retry="chargeAuthorization" />
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

</template>

<script>
import gql from 'graphql-tag';
import PaystackCreditCardSelect from './PaystackCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationPaystackPayment",
    mixins: [session],
    components: {
      ErrorHandler,
        PaystackCreditCardSelect
    },

    props: {
        property: Object,
        reservation: Object,
        charges: Array,
        total: Number,
        currency: String
    },

    data() {
        return {
            pay: false,
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
      paystackCustomerFetched(customer) {
          this.customer = customer;
      },

      creditCardSelected(card) {
          this.creditCard = card;
          this.$emit('credit-card', card)
      },

      chargeAuthorization() {
          this.error= null;
          this.chargingAuthorization = true;

          this.createSessionActivity({
            title: `Payment Attempt via Paystack`,
            description: `Attempting to make payment via Paystack with card ***${this.creditCard?.last4}`
          })

           Promise.all(this.charges.map(charge => {
             if(!charge.receipt_email) {
               charge.receipt_email = this.receiptEmail
             }
              return this.$store.dispatch('mutate', {
                  mutation: gql `
                      mutation chargeReservationPaystackAuthorization($reservation_id: ID!, $authorization_code: ID!,  $charge: ReservationPaystackPaymentChargeInput!) {
                          chargeReservationPaystackAuthorization(reservation_id: $reservation_id, authorization_code: $authorization_code, charge: $charge) {
                              status
                              message
                              data {
                                  reference
                              }
                          }
                      }
                  `,
                  variables: {
                      reservation_id: this.reservation.id,
                      authorization_code: this.creditCard.authorization_code,
                      charge
                  }
              })
          }))
          .then(responses => {
              return Promise.all(
              responses.filter(response => response.data.chargeReservationPaystackAuthorization !== null && response.data.chargeReservationPaystackAuthorization.status)
              .map(response => {
                  const charge = response.data.chargeReservationPaystackAuthorization;
                  return this.$store.dispatch('mutate', {
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
                          reference: charge.data.reference,
                          property_id: this.property.id,
                          reservation_id: this.reservation.id,
                      }
                  })
              }));
          })
          .then(responses => {
              const transactions = responses
                                  .map(response => response.data.verifyReservationPaystackTransaction)
                                  .filter(transaction => transaction !== null)
                                  .map(transaction => transaction.data);

              if(transactions.length) {
                  const totalPaid = transactions.map(transaction => transaction.amount)
                                  .reduce((a,b) => a+b, 0);
                  this.$store.commit('SNACKBAR', {
                      status: true,
                      color: 'success',
                      text: `${this.reservation.currency.toUpperCase()}${totalPaid/100} paid`
                  });

                  this.$emit('transactions', transactions);
                  this.pay = false;

                  transactions.forEach(async transaction => {
                    await this.createSessionActivity({
                      title: `Payment via Paystack: ${transaction.status}`,
                      description: `Payment of ${transaction.currency} ${transaction.amount} (${transaction.reference}) was made via Paystack with card  ***${transaction.authorization?.last4}`
                    })
                  })
              }
          })
          .catch(e => {
              this.error = e;
              this.createSessionActivity({
                title: `Failed Payment via Paystack`,
                description: `Payment via Paystack failed: ${e.message}`
              })
          })
          .finally(() => {
              this.chargingAuthorization = false;
              this.verifyingTransaction = false;
          })
      },

  }

}
</script>