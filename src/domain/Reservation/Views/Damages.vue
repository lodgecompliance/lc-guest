<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <h2 class="headline my-5">Damages</h2>
        <reservation-damages :reservation="reservation">
          <template #damage-actions="{ damage, damageUpdated }">
            <reservation-damage-dispute
                v-if="!damage.dispute"
                :reservation="reservation"
                :damage="damage"
                @damage-disputed="dmg => damageUpdated(dmg)"
            />
            <reservation-damage-payment
                v-if="damage.amount > 0 && !damage.payment"
                :reservation="reservation"
                :property="property"
                :damage="damage"
                :payment-provider="reservation.setting.payment_gateway"
                @damage-payment="dmg => damageUpdated(dmg)"
            />
          </template>
          <template #footer-actions="{ createDamageReport }">
            <v-card-actions class="mt-2">
              <v-spacer></v-spacer>
              <v-btn
                  color="primary"
                  @click="createDamageReport"
                  small depressed>
                <v-icon>mdi-plus</v-icon>
                New Damage Report
              </v-btn>
            </v-card-actions>
          </template>
        </reservation-damages>
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import ReservationDamages from "@/domain/Reservation/Widgets/ReservationDamages.vue";
import ReservationDamageDispute from "@/domain/Reservation/Components/ReservationDamageDispute.vue";
import ReservationDamagePayment from "@/domain/Reservation/Widgets/ReservationDamagePayment.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";

export default {
  name: 'ReservationDamagesPage',
  components: {
    ReservationCheckedinPage,
    ReservationDamagePayment, ReservationDamageDispute, ReservationDamages,
    ReservationPage
  }
}
</script>
