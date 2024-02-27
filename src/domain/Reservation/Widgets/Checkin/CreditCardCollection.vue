<template>
    <div>
        <template v-if="gateway">
            <stripe-credit-card-select
                v-if="gateway === 'stripe'"
                :property="property"
                :reservation="reservation"
                source="payment-method"
                @customer="stripeCustomerReceived"
                @credit-card="stripeCreditCard" 
            />

            <paystack-credit-card-select
            v-else-if="gateway === 'paystack'"
            :property="property"
            :reservation="reservation"
            :can-create-new="true"
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
    </div>
</template>

<script>
import StripeCreditCardSelect from '../../Components/Payment/StripeCreditCardSelect.vue';
import PaystackCreditCardSelect from '../../Components/Payment/PaystackCreditCardSelect.vue';
import session from "@/domain/Reservation/Mixins/session";

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
            message: null
        }
    },
    computed: {
        gateway() {
            return this.reservation && this.reservation.setting &&  this.reservation.setting.payment_gateway
            ?  this.reservation.setting.payment_gateway : null;
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
        }
    },

    methods: {

      stripeCustomerReceived(customer) {

      },

      stripeCreditCard(card) {
          this.$emit('credit-card', {
            stripe: card.card || card.payment_method ? card : null
          })
      },

      paystackCreditCard(card) {
          this.$emit('credit-card', { paystack: card })
      }
    },
}
</script>