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
  name: "ReservationPaymentRequestPayment",
  components: {ReservationPayment},
  data() {
    return {}
  },

  props: {
    property: Object,
    reservation: Object,
    request: Object,
    paymentProvider: String
  },

  computed: {
    charge() {
      return {
        id: this.request.id,
        currency: this.reservation.currency,
        amount: this.request.amount,
        description: this.request.description,
        type: 'instant',
        optional: false,
        enable: true,
        title: this.request.title
      }
    },

    chargePayload() {
      return {
        property_id: this.property.id,
        description: `Payment for payment request (${this.request.title}) at ${this.property.name}`,
        amount: this.request.amount * 100,
        currency: this.reservation.currency,
        receipt_email: this.reservation.user.email,
        metadata: {
          user_id: this.reservation.user_id,
          property_id: this.property.id,
          reservation_id: this.reservation.id,
          payment_request_id: this.request.id,
          refundable: false
        },
        capture: true
      }
    }
  },

  methods: {
    paymentMade(payment) {
      this.$emit('payment-request-payment', {
        id: this.request.id,
        payment: payment
      })
    }
  }
}
</script>