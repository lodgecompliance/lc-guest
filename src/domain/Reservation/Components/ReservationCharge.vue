<template>
    <div>
      <v-list-item v-bind="$attrs.listItem">
          <slot name="select" v-bind="{ paymentVariables, payment, totalPaying }" />
          <v-list-item-content>
              <v-list-item-title> {{ charge.title  }} <span v-show="charge.optional"> (optional) </span> </v-list-item-title>
              <v-list-item-subtitle>{{ charge.description }}</v-list-item-subtitle>
              <v-list-item-subtitle v-if="baseMultiplier">
                  Rate: {{ charge.amount * 100 | money_value(currency) }}/{{ baseMultiplier.unit }} for {{ baseMultiplier.quantity == 1 ? 'a' : baseMultiplier.quantity }} {{ baseMultiplier.unit.toLowerCase() }}<span v-show="baseMultiplier.quantity > 1">s</span>
              </v-list-item-subtitle>
          </v-list-item-content>
          <h4 v-if="!payment" class="mt-2">{{ totalPaying | money_value(currency) }}</h4>
      </v-list-item>
      <div class="my-2">
          <template v-if="payment">
              <stripe-payment
              v-if="payment.gateway == 'stripe'"
              :charge="charge"
              :payment="payment.payment"
              :dialog="viewPayment"
              @dialog-closed="viewPayment = false"
              >
                  <template #list-action>
                      <v-btn icon @click="viewPayment = true" title="view payment">
                          <v-icon>mdi-eye</v-icon>
                      </v-btn>
                  </template>

                <template #options="props">
                  <slot name="options" v-bind="props" />
                </template>

              </stripe-payment >

              <paystack-payment
              v-if="payment.gateway == 'paystack'"
              :charge="charge"
              :payment="payment.payment"
              >
              </paystack-payment>

          </template>
      </div>
      <slot v-bind="{ property, reservation, charge, payment, paymentVariables, baseMultiplier, baseTotalAmount, customMultipliers }" />
    </div>
</template>

<script>

import StripePayment from './Payment/StripeChargePayment.vue';
import PaystackPayment from './Payment/PaystackChargePayment.vue';
import reservationMixin from '../Mixins/reservation';

export default {
    name: "ReservationCharge",
    mixins: [reservationMixin],
    components: {
        StripePayment, PaystackPayment
    },
    data(){
        return {
            loading: false,
            paymentVariables: null,
            viewPayment: false,
        }
    },

     props: {
        reservation: Object,
        guests: Array,
        payment: Object,
        charge:Object,
        creditCard: Object,
        canPay: Boolean,
        capturePreAuthorize: Boolean,
    },

    computed: {
        currency() {
            return this.charge.currency ? this.charge.currency : this.property.currency;
        },

        isPreAuthorized(){
            return this.charge.type === 'pre-authorize'
        },

        baseMultiplier() {
            if(this.charge.unit) {
                let quantity = 0;
                switch (this.charge.unit) {
                    case 'Stay':
                        quantity = 1
                        break;
                    case 'Guest':
                        quantity =  this.noOfGuest
                        break;
                    case 'Night':
                        quantity =  this.noOfNight
                        break;
                }
               return {
                    unit: this.charge.unit,
                    quantity,
                }
            }
            return null;
        },

        baseTotalAmount() {
            if(!this.baseMultiplier) return this.charge.amount * 100;
            return this.baseMultiplier.quantity * this.charge.amount * 100;
        },

        customMultipliers() {
            if (this.charge.multipliers) {
                return this.charge.multipliers.map(m => {
                    return {
                        ...m,
                        min: parseInt(m.min),
                        max: parseInt(m.max),
                        quantity: 1,
                    }
                })
            }
            return []
        },

        multipliers() {
            if(!this.charge) return [];
            let multipliers = [];

            if(this.baseMultiplier) multipliers.push(this.baseMultiplier);

            return multipliers.concat(this.customMultipliers);
        },

        chargeMultiples() {
            return this.customMultipliers.map(m => `per ${m.unit}`).join(', ');
        },

        paymentMutiples() {
            if(!this.payment) return null;
            if(this.payment.metadata && this.payment.metadata.custom_multipliers) {
                return this.payment.metadata.custom_multipliers.map(multiple => {
                    return `${multiple.quantity} ${multiple.unit}`;
                }).join(', ');
            }
            return null;
        },

        customerName() {
            return this.$store.getters.current_user.profile.full_name;
        },

        totalPaying() {
            let total = this.baseTotalAmount;
            
            if(this.paymentVariables && this.paymentVariables.metadata.custom_multipliers && this.paymentVariables.metadata.custom_multipliers.length) {
                total = this.paymentVariables.metadata.custom_multipliers.filter(multiplier => multiplier.quantity > 0)
                .map(multiplier => this.baseTotalAmount * multiplier.quantity )
                .reduce((a,b) => a + b, 0 );
            }

            return total;
        },

        
    },

   
    methods: {
        updateStripePayment(payment){
            this.stripePayment = payment;
        },
    },

    watch: {
        charge: {
            immediate: true,
            handler(charge) {
                if (!charge) return;
                const variables = {
                    property_id: this.property.id,
                    amount: charge.amount * 100,
                    currency: this.currency,
                    description: `${this.isPreAuthorized ? 'Authorization' : 'Payment'} for ${this.charge.title} at ${this.property.name} by ${this.customerName}`,
                    capture: !this.isPreAuthorized || this.capturePreAuthorize,
                    metadata: {
                        user_id: this.$store.getters.current_user.profile.id,
                        property_id: this.property.id,
                        reservation_id: this.reservation.id,
                        charge_id: charge.id,
                        base_multiplier: this.baseMultiplier,
                        custom_multipliers: this.customMultipliers,
                        refundable: this.isPreAuthorized && this.capturePreAuthorize
                    }
                }

                if(this.$store.getters.current_user.profile.email){
                    variables.receipt_email = this.$store.getters.current_user.profile.email
                }else if(this.$store.getters.current_user.auth.email){
                    variables.receipt_email = this.$store.getters.current_user.auth.email
                }
                this.paymentVariables = variables;
            }
        },

        totalPaying: {
            immediate: true,
            handler(total) {
                this.$emit('total', total);
            }
        },

        baseMultiplier: {
            immediate: true,
            handler(multiplier) {
                this.paymentVariables.metadata.base_multiplier = multiplier;
                this.$emit('calculate');
            }
        }
    }
}
</script>