<template>
  <stripe-payment
      v-if="provider === 'stripe'"
      :property="property"
      :reservation="reservation"
      :charge="charge"
      :payload="payload"
      :total="charge.amount"
      :currency="charge.currency"
      :source-from="`payment-method`"
      @transaction="stripePayment"
      @credit-card="card => $emit('stripe-credit-card', card)"
      class="my-2"
  >
    <template #default="{ startPayment, loading: paying }">
      <v-btn @click="startPayment" :loading="paying" color="primary" depressed small>
        Pay {{ charge.amount | money(charge.currency) }}
      </v-btn>
    </template>
  </stripe-payment>

  <paystack-payment
      v-else-if="provider === 'paystack'"
      :property="property"
      :reservation="reservation"
      :charge="charge"
      :payload="payload"
      :total="charge.amount"
      :currency="charge.currency"
      @transactions="paystackPayments"
      @credit-card="card => $emit('paystack-credit-card', card)"
      class="my-2"
  >
    <template #default="{ startPayment, loading: paying }">
      <v-btn @click="startPayment" :loading="paying" color="primary" depressed small>
        Pay {{ charge.amount | money(charge.currency) }}
      </v-btn>
    </template>
  </paystack-payment>
</template>

<script>

import StripePayment from "@/domain/Reservation/Components/Payment/StripeSinglePayment";
import PaystackPayment from "@/domain/Reservation/Components/Payment/PaystackSinglePayment.vue";
export default {
  name: "ReservationPayment",
  components: { StripePayment, PaystackPayment},
  data() {
    return {}
  },

  props: {
    property: Object,
    reservation: Object,
    provider: String,
    charge: Object,
    payload: Object,
  },

  methods: {
    stripePayment(payment) {
      this.$emit('payment', {
        amount: payment.amount,
        reference: payment.id,
        gateway: 'stripe',
        status: payment.status,
        payment_data: JSON.stringify(payment)
      })
    },

    paystackPayment(payment) {
      this.$emit('payment', {
        amount: payment.amount,
        reference: payment.reference,
        gateway: 'paystack',
        status: payment.status,
        payment_data: JSON.stringify(payment)
      })
    }
  }
}
</script>