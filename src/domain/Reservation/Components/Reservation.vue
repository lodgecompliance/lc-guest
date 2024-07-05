<template>
    <v-card :to="{ name: 'reservation.show', params: { reservation: reservation.id } }" flat>
        <v-img
            :src="reservation.property.cover_image"
            class="white--text align-end"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="150px"
        >
          <v-card-title class="d-flex">
            <div class="d-flex align-center">
              <profile-avatar :profile="reservation.property" :size="40" />
              <span class="ml-2">{{ reservation.property.name }}</span>
            </div>
            <v-spacer></v-spacer>
          </v-card-title>
        </v-img>
        <v-card-subtitle>
          <p><v-icon>mdi-map-marker</v-icon> {{reservation.property.address}}</p>
        </v-card-subtitle>
          <v-card-text class="mt-n3 d-flex justify-space-between">
            <div>
              <small v-if="reservation.checkedin" class="gray--text">{{ checkedinAtMoment.format('MMM D, YYYY') }}, {{ checkinMoment.fromNow() }}</small>
              <small v-else class="warning--text">Waiting for checkin</small>
            </div>
            <reservation-status :reservation="reservation" />
          </v-card-text>
      </v-card>
</template>

<script>
    import ReservationStatus from "@/domain/Reservation/Components/ReservationStatus";
    import reservation from "@/domain/Reservation/Mixins/reservation";
    import ProfileAvatar from "@/components/ProfileAvatar.vue";
    export default {
      components: {ProfileAvatar, ReservationStatus},
      mixins: [reservation],
      data(){
            return {
                reservation: null
            }
        },
        props: ['_reservation'],
        computed:{

        },
        methods:{
            
        },
        watch: {
            _reservation: {
              immediate: true,
              handler(r) {
                this.reservation = r;
              }
            }
        }
    }
</script>

<style scoped>

</style>
