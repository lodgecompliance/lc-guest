<template>
    <v-card>
      <v-card-text>
        <template v-if="gateway">
          <stripe-credit-card-select
              v-if="gateway === 'stripe'"
              :property="property"
              :reservation="reservation"
              :source="stripeSource"
              :value="stripeCardValue"
              @credit-card="stripeCreditCard"
          />

          <paystack-credit-card-select
              v-else-if="gateway === 'paystack'"
              :property="property"
              :reservation="reservation"
              :can-create-new="true"
              :value="paystackCardValue"
              @credit-card="paystackCreditCard"
          />
          <v-alert v-else
                   colored-border
                   border="top"
                   type="error"
          >
            Payment gateway not supported
          </v-alert>

        </template>
        <v-alert v-else
                 colored-border
                 border="top"
                 type="error"
        >
          No payment gateway available
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <slot v-bind="{ creditCard, submitting, submit }">
          <v-btn color="primary" :loading="submitting" @click="submit" depressed>Continue</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
</template>

<script>
import StripeCreditCardSelect from '../../Components/Payment/StripeCreditCardSelect.vue';
import PaystackCreditCardSelect from '../../Components/Payment/PaystackCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";
import {mapGetters} from "vuex";

export default {
    name: "ReservationCheckinCreditCard",
    mixins: [session],
    components: {
        StripeCreditCardSelect, PaystackCreditCardSelect
    },
    props:{
        reservation: Object,
        property: Object,
    },
    data() {
        return {
            message: null,
            creditCard: null,
            submitting: false,
        }
    },
    computed: {
      ...mapGetters(['checkin_session']),
        gateway() {
            return this.reservation && this.reservation.setting &&  this.reservation.setting.payment_gateway
            ?  this.reservation.setting.payment_gateway : null;
        },
        stripeSource() {
          return 'payment-method';
        },
        stripeCardValue() {
          return {
            'card': this.creditCard?.stripe?.card,
            'payment-method': this.creditCard?.stripe?.payment_method,
          }[this.stripeSource]
        },
        paystackCardValue() {
          return this.creditCard?.paystack
        },
        paystackCharge() {
            const variables = {
                property_id: this.property.id,
                amount: 5000,
                currency: 'NGN',
                description: `Credit card collection`,
                capture: true,
                metadata: {
                    user_id: this.$store.getters.current_user.profile.id,
                    property_id: this.property.id,
                    reservation_id: this.reservation.id,
                }
            }
            if(this.$store.getters.current_user.profile.email){
                variables.receipt_email = this.$store.getters.current_user.profile.email
            }else if(this.$store.getters.current_user.auth.email){
                variables.receipt_email = this.$store.getters.current_user.auth.email
            }
            return variables;
        },
    },

    methods: {

      stripeCreditCard(card) {
        this.creditCard = {
          stripe: card.card || card.payment_method ? card : null
        }
        this.$emit('credit-card',this.creditCard )
      },

      paystackCreditCard(card) {
        this.creditCard = { paystack: card }
        this.$emit('credit-card', this.creditCard )
      },

      submit() {
        this.submitting = true;
        this.submitCreditCard(this.creditCard).then(() => {
          this.$emit('continue', this.creditCard);
        }).catch(e => {
          console.log(e)
        }).finally(() => {
          this.submitting = false;
        })
      }
    },
  watch: {
    checkin_session: {
      immediate: true,
      deep: true,
      handler() {
        const saved = this.getCheckinData('credit_card');
        this.creditCard = {
          stripe: saved?.stripe,
          paystack: saved?.paystack
        }
      }
    },
    creditCard: {
      immediate: true,
      deep: true,
      handler(cc) {
        this.$emit('credit-card', cc)
      }
    }
  }
}
</script>