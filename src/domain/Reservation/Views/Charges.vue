<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <template #default="{ checkin, getReservationCheckin }">
          <h2 class="headline my-5">Charges</h2>
          <reservation-charges
              :reservation="reservation"
              :property="property"
              :_payments="checkin.payments"
          />
          <reservation-payment-requests
              :reservation="reservation"
              class="mx-n6">
            <template  #actions="{ request, requestUpdated }">
              <reservation-payment-request-payment
                  v-if="!request.payment"
                  :reservation="reservation"
                  :property="property"
                  :request="request"
                  :payment-provider="reservation.setting.payment_gateway"
                  @payment-request-payment="req => requestUpdated(req)"
              />
            </template>
          </reservation-payment-requests>
          <h2 class="headline my-5">All Payments</h2>
          <reservation-payments
              class="mt-3"
              outlined
              :property="property"
              :reservation="reservation"
              :payments="checkin.payments"
              :header="false"
          />
          <h2 class="headline">Credit Card</h2>
          <template v-if="checkin.credit_card">
            <template v-if="checkin.credit_card.stripe" >
              <stripe-credit-card
                  v-if="checkin.credit_card.stripe.card"
                  :card="checkin.credit_card.stripe.card">
              </stripe-credit-card>
              <stripe-payment-method
                  v-if="checkin.credit_card.stripe.payment_method"
                  :method="checkin.credit_card.stripe.payment_method">
              </stripe-payment-method>
            </template>
            <template
                v-if="checkin.credit_card.paystack">
              <paystack-credit-card
                  v-if="checkin.credit_card.paystack"
                  :card="checkin.credit_card.paystack">
              </paystack-credit-card>
            </template>
          </template>
          <template v-else>
            <p class="text-center grey--text mt-5">No credit card</p>
          </template>
        </template>
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import StripePaymentMethod from "@/components/Utilities/StripePaymentMethod.vue";
import PaystackCreditCard from "@/components/Utilities/PaystackCreditCard.vue";
import ReservationPayments from "@/domain/Reservation/Components/Payment/ReservationPayments.vue";
import StripeCreditCard from "@/components/Utilities/StripeCreditCard.vue";
import ReservationCharges from "@/domain/Reservation/Widgets/Checkin/ReservationCharges.vue";
import ReservationPaymentRequests from "@/domain/Reservation/Widgets/ReservationPaymentRequests.vue";
import ReservationPaymentRequestPayment from "@/domain/Reservation/Widgets/ReservationPaymentRequestPayment.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";

export default {
  name: 'ReservationChargesPage',
  components: {
    ReservationCheckedinPage,
    ReservationPaymentRequestPayment, ReservationPaymentRequests,
    ReservationCharges,
    StripeCreditCard, ReservationPayments, PaystackCreditCard, StripePaymentMethod,
    ReservationPage
  }
}
</script>
