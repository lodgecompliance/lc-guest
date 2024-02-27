<template>
  <reservation-payment
      :charge="charge"
      :payload="chargePayload"
      :property="property"
      :reservation="reservation"
      :provider="paymentProvider"
      @payment="paymentMade"
  />
</template>

<script>
import ReservationPayment from "@/domain/Reservation/Components/Payment/Payment.vue";
export default {
  name: "ReservationDamagePayment",
  components: { ReservationPayment },
  data() {
    return {}
  },

  props: {
    property: Object,
    reservation: Object,
    damage: Object,
    paymentProvider: String
  },

  computed: {
    charge() {
      return {
        id: this.damage.id,
        currency: this.reservation.currency,
        amount: this.damage.amount,
        description: this.damage.description,
        type: 'instant',
        optional: true,
        enable: true,
        title: this.damage.title
      }
    },

    chargePayload() {
      return {
        property_id: this.property.id,
        description: `Payment for damage (${this.damage.title}) at ${this.property.name}`,
        amount: this.damage.amount * 100,
        currency: this.reservation.currency,
        receipt_email: this.reservation.user.email,
        metadata: {
          user_id: this.reservation.user_id,
          property_id: this.property.id,
          reservation_id: this.reservation.id,
          damage_id: this.damage.id,
          refundable: false
        },
        capture: true
      }
    }
  },

  methods: {
    paymentMade(payment) {
      this.$emit('damage-payment', {
        id: this.damage.id,
        payment
      })
    }
  }
}
</script>