<template>
    <data-container :loading="loading">
        <template v-slot:loading>
            <div  v-for="i in 4" :key="i">
                <v-skeleton-loader
                    type="heading"
                    class="my-2"
                ></v-skeleton-loader>
                <v-skeleton-loader
                    type="card, button"
                    height="60"
                    class="my-2"
                ></v-skeleton-loader>
                <v-divider></v-divider>
            </div>
        </template>
        <v-form ref="chargePaymentForm" v-if="charges && charges.length">

            <slot name="label" v-bind="  { allChargesPaid } "/>

            <div v-for="charge in allCharges" :key="charge.id" >
                <reservation-charge
                class="my-1"
                :charge="charge"
                :payment="chargePayment(charge)"
                :reservation="reservation"
                :guests="guests"
                :property="property"
                :credit-card="creditCard"
                :listItem="{class: 'px-0'}"
                :capture-pre-authorize="capturePreAuthorize"
                @calculate="calculateCharges"
                >
                    <template v-slot:options="props">
                        <slot name="options" v-bind="{ ...props, updateStripePayment }" />
                    </template>
                    <template v-slot:default="props">
                      <slot v-bind="props" />
                      <template v-if="canPay && !chargePayment(charge)">
                        <template v-if="props.customMultipliers && props.customMultipliers.length">
                          <div  class=" d-flex flex-wrap">
                            <v-text-field
                                v-for="(multiplier, i) in props.customMultipliers" :key="i"
                                outlined dense
                                type="number"
                                :label="multiplier.unit"
                                :rules="[
                                  (v) => !!v || `Enter valid number`,
                                  (v) => v  >= multiplier.min || `Minimum is ${multiplier.min}`,
                                  (v) => v  <= multiplier.max || `Maximum is ${multiplier.max}`,
                              ]"
                                :value="props.paymentVariables.metadata.custom_multipliers[i].quantity"
                                @input="(v) => {
                                  props.paymentVariables.metadata.custom_multipliers[i].quantity = parseInt(v);
                                  calculateCharges();
                              }"
                            >
                            </v-text-field>
                          </div>
                        </template>
                        <reservation-stripe-single-payment
                          v-if="reservation.setting.payment_gateway === 'stripe'"
                          :property="property"
                          :reservation="reservation"
                          :payload="props.paymentVariables"
                          :charge="charge"
                          :total="chargeTotal(props.paymentVariables)/100"
                          :currency="currency"
                          :source-from="`payment-method`"
                          :available-source="submittedStripeSource && submittedStripeSource.payment_method ? submittedStripeSource.payment_method : null"
                          @transaction="newStripeTransaction"
                          @credit-card="stripeCreditCardReceived"
                        >
                          <template #default="{ startPayment, loading: paying }">
                            <v-btn @click="startPayment" :loading="paying" color="primary" depressed small>
                              {{ props.paymentVariables.capture ? 'Pay' : 'Authorize' }}
                              {{ chargeTotal(props.paymentVariables) | money_value(currency)}}
                            </v-btn>
                          </template>
                        </reservation-stripe-single-payment>
                        <reservation-paystack-single-payment
                            v-if="reservation.setting.payment_gateway === 'paystack'"
                            :property="property"
                            :reservation="reservation"
                            :charge="charge"
                            :payload="props.paymentVariables"
                            :total="chargeTotal(props.paymentVariables)/100"
                            :currency="currency"
                            :available-authorization="submittedPaystackAuthorization"
                            @credit-card="paystackCreditCardReceived"
                            @transaction="newPaystackTransaction"
                            class="my-2"
                        >
                          <template #default="{ startPayment, loading: paying }">
                            <v-btn @click="startPayment" :loading="paying" color="primary" depressed small>
                              {{ props.paymentVariables.capture ? 'Pay' : 'Authorize' }}
                              {{ chargeTotal(props.paymentVariables) | money_value(currency)}}
                            </v-btn>
                          </template>
                        </reservation-paystack-single-payment>
                      </template>
                    </template>
                </reservation-charge>
            </div>
        </v-form>
        <div v-else class="text-center grey--text py-5">
            No charge for the reservation
        </div>
    </data-container>
</template>

<script>
import DataContainer from '../../../../components/DataContainer.vue';
import ReservationCharge from '../../Components/ReservationCharge.vue';
import GET_RESERVATION_PAYMENTS from '../../Queries/getReservationPayments';
import CheckinPayment from '../../Helpers/checkin';
import session from "@/domain/Reservation/Mixins/session";
import ReservationStripeSinglePayment from "@/domain/Reservation/Components/Payment/StripeSinglePayment.vue";
import ReservationPaystackSinglePayment from "@/domain/Reservation/Components/Payment/PaystackSinglePayment.vue";

export default {
    name: "ReservationCharges",
    mixins: [session],
    components:{
      ReservationPaystackSinglePayment,
      ReservationStripeSinglePayment,
      DataContainer,
      ReservationCharge,
    },
    data(){
        return {
            loading: false,
            charges: [],
            selectedCharges: [],
            totalInstantCharges: 0,
            totalPreauthorizedCharges: 0,
            creditCard: {
                paystack: null,
                stripe: null,
            },
            payments: {
                stripe: [],
                paystack: []
            },
        }
    },

    computed: {
        allCharges() {
            return this.charges.concat(this.attachments)
        },
        currency() {
            return this.reservation.currency ? this.reservation.currency : this.property.default_currency;
        },

        selectedInstantCharges() {
            return this.selectedCharges.filter(charge => charge.capture);
        },

        selectedPreauthorizedCharges() {
            return this.selectedCharges.filter(charge => !charge.capture);
        },

        stripePayments() {
            return this.payments && this.payments.stripe ? this.payments.stripe : [];
        },

        paystackTransactions() {
            return this.payments && this.payments.paystack ? this.payments.paystack : [];
        },

        allChargesPaid() {
            return this.charges.every(charge => this.stripePayments
                    .find(p => p.metadata.charge_id === charge.id) !== undefined
                    || this.paystackTransactions
                      .find(p =>
                          p.charges.find(c => c.metadata.charge_id === charge.id) !== undefined)
                        !== undefined) ;
        },

        checkinPayment() {
            return new CheckinPayment( { payments: this.payments } );
        },

        submittedPaystackAuthorization() {
          return this.submittedCreditCard?.paystack
        },

        submittedStripeSource() {
          return this.submittedCreditCard?.stripe
        }

    },

    props: {
        reservation: Object,
        guests: Array,
        property: Object,
        refresh: Boolean,
        canPay: Boolean,
        attachments: {
            default: () => []
        },
        _payments: {
            type: Object,
            default: () => {
                return {
                    paystack: [],
                    stripe: []
                }
            }
        },
        fetchPayments: {
            type: Boolean,
            default: () => false
        },
        capturePreAuthorize: Boolean,
        submittedCreditCard: Object,
    },
    
    methods: {

        stripeCreditCardReceived(card) {
            this.creditCard.stripe = card
            this.$emit('credit-card', this.creditCard);
        },

        paystackCreditCardReceived(card) {
            this.creditCard.paystack = card
            this.$emit('credit-card', this.creditCard);
        },

        getCharges(){
            this.charges = [];
            // this.loading = true;
            if(this.reservation.balance && this.reservation.currency){
                this.charges.push({
                    id: this.reservation.id,
                    currency: this.reservation.currency,
                    amount: this.reservation.balance,
                    description: "Reservation balance",
                    type: 'instant',
                    optional: false,
                    enable: true,
                    unit: 'Stay',
                    title: "Reservation Balance"
                });
            }

            this.charges = this.charges.concat(this.reservation.charges);
            this.getPaidCharges();
        
        },

        getReservationPayments() {
            // Get payments for the reservation
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_RESERVATION_PAYMENTS,
                variables: {
                    id: this.reservation.id
                }
            })
            .then(response => {
                if(response.data.getReservationPayments) {
                    this.payments = response.data.getReservationPayments;
                    this.getPaidCharges();
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    message: `Could not get charges.`,
                    retry: () => this.getReservationPayments(),
                    exception: e
                });
            })
            .finally(() => {
                this.loading = false;
            })
        },

        getPaidCharges(){
            const paidCharges = this.allCharges.map(charge => {
                return {
                    ...charge,
                    payment: this.checkinPayment.chargePayment(charge)
                }
            });
            // this.creditCard = {
            //     stripe: {
            //         card: this.stripePayments.length ? this.stripePayments[0].source : null,
            //         payment_method: this.stripePayments.length ? { id: this.stripePayments[0].payment_method } : null
            //     },
            //     paystack: this.paystackTransactions.length ? this.paystackTransactions[0].authorization : null
            // }
            this.$emit('charges-payment', paidCharges);
        },

        chargeTotal(charge) {
            let baseTotal = charge.amount;

            if(charge.metadata?.base_multiplier?.quantity > 0) {
                baseTotal = charge.metadata.base_multiplier.quantity * charge.amount;
            }

            if(charge.metadata?.custom_multipliers?.length) {
                return charge.metadata.custom_multipliers.filter(multiplier => multiplier.quantity > 0)
                .map(multiplier => baseTotal * multiplier.quantity )
                .reduce((a,b) => a + b, 0 );
            }

            return baseTotal;
        },

        calculateCharges() {
            this.totalInstantCharges = this.selectedInstantCharges
                    .map(charge => this.chargeTotal(charge))
                    .reduce((a,b) => a+b, 0 );

            this.totalPreauthorizedCharges = this.selectedPreauthorizedCharges
                    .map(charge => this.chargeTotal(charge))
                    .reduce((a,b) => a+b, 0 );
        },

        chargePayment(charge) {
            return this.checkinPayment.chargePayment(charge)
        },

        newStripeTransaction(transaction) {
            this.payments.stripe.push(transaction);
            this.getPaidCharges();
        },

        newPaystackTransaction(transaction) {
            this.payments.paystack.push(transaction);
            this.getPaidCharges();
        },

      updateStripePayment(updatedPayment) {
        this.payments.stripe = this.payments.stripe.map(payment => {
          if(payment.id == updatedPayment) {
            Object.assign(payment, updatedPayment);
          }
          return payment;
        })
      },

    },

    mounted() {
        if(this.fetchPayments) this.getReservationPayments();
        if(this.submittedCreditCard) this.creditCard = this.submittedCreditCard;
    },

    watch: {
        reservation: {
            immediate: true,
            handler(){
                this.getCharges()
            }
        },

        refresh: {
            handler(refresh){
                if(refresh) this.getCharges()
            }
        },

        selectedCharges: {
            immediate: true,
            handler() {
                this.calculateCharges();
            }
        },

        paystackTransactions: {
            immediate: true,
            handler(transactions) {
                if(transactions) this.$emit('paystack-transactions', transactions)
            }
        },

        attachments: {
            immediate: true,
            handler() {
                this.getPaidCharges();
            }
        },

        creditCard: {
            immediate: true,
            handler(card) {
                this.$emit('credit-card', card)
            }
        },
        _payments: {
            immediate: true,
            handler(payments) {
                this.payments = payments
            }
        },

    }
}
</script>