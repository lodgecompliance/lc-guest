<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <h2 class="headline my-5">Guests</h2>
        <reservation-guests
            :reservation="reservation"
            :include-primary-guest="true"
        />
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import ReservationGuests from "@/domain/Reservation/Widgets/ReservationGuests.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";

export default {
  name: 'ReservationIdVerificationPage',
  components: {
    ReservationCheckedinPage,
    ReservationGuests,
    ReservationPage
  }
}
</script>
