<template>
    <div>
      <v-alert colored-border border="left" type="info">
        <small class="grey--text">You'll be charged NGN {{ fee }} for card authorization</small>
      </v-alert>
      <paystack-payment
      :property="property"
      :reservation="reservation"
      :charges="[charge]"
      @transaction="paystackTransaction"
      :btn="{text: false, small: true, color: 'primary', depressed: true }"
      >
        Authorize card
      </paystack-payment>
    </div>
</template>

<script>
import PaystackPayment from './PaystackReservationChargePayment.vue';
import session from "@/domain/Reservation/Mixins/session";

export default {
    name: "PaystackNewCreditCard",
    mixins: [session],
    components: {
        PaystackPayment
    },
    props:{
        property: Object,
        reservation: Object,
    },
    data() {
        return {
            fee: 50,
        }
    },
    computed: {

        charge() {
            const variables = {
                property_id: this.property.id,
                amount: this.fee * 100,
                currency: 'NGN',
                description: `Credit card authorization`,
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
        paystackTransaction(transaction) {
          this.createSessionActivity({
            title: "Card Authorized via Paystack",
            description: `Card ***${transaction.authorization?.last4} was authorized via Paystack`
          })
          this.$emit('credit-card', transaction.authorization)
        }
    },

    watch: {

    }
}
</script>