<template>
  <reservation-page>
    <template #checkedin="{ reservation, property }">
      <reservation-checkedin-page
          :reservation="reservation"
          :property="property"
      >
        <h2 class="headline my-5">Instructions</h2>
        <div v-if="reservation.approved">
          <div class="py-5" v-if="reservation.instruction">
            {{reservation.instruction}}
          </div>
          <div class="text-center py-5 grey--text" v-else>
            No checkin instruction
          </div>
        </div>
        <div v-else>
        <v-alert
            border="left"
            colored-border
            type="warning"
            class="mt-5"
        >
          Your checkin needs to be approved before you can see instructions
        </v-alert>
      </div>
      </reservation-checkedin-page>
    </template>
  </reservation-page>
</template>

<script>
import ReservationPage from "@/domain/Reservation/Views/Show.vue";
import ReservationCheckedinPage from "@/domain/Reservation/Widgets/CheckedInPage.vue";

export default {
  name: 'ReservationInstructionPage',
  components: {
    ReservationCheckedinPage,
    ReservationPage
  }, 
  data(){
      return {}
  },

    computed:{},
  
  methods:{}
}
</script>
