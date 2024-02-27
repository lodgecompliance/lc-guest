<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <h2 class="headline my-5">ID Verification</h2>
        <template #default="{ checkin, getReservationCheckin }">
            <v-alert
                border="left"
                colored-border
                type="warning"
                class="mt-5"
            >
              No ID verification available
            </v-alert>
        </template>
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";

export default {
  name: 'ReservationIdVerificationPage',
  components: {
    ReservationCheckedinPage,
    ReservationPage
  }
}
</script>
