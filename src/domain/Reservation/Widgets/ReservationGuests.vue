<template>
    <div>
        <template v-if="reservation.allow_additional_guest">
            <div class="mb-2">
              <small class="grey--text">Guest checkin URL</small>
              <clip-board v-model="reservation.guest_checkin_url" />
              <v-alert
                  v-if="reservationOwner && guests.filter(g => g.user_id == null).length"
                   type="info"
                   colored-border
                   prominent
                   border="left">
                Don't forget to send the link above to your guests for confirmation
              </v-alert>
            </div>
            <reservation-guest-form
            v-if="createNew"
            class="mt-5"
            :reservation="reservation"
            @cancel="createNew = false"
            @created="guestAdded"
            />
        </template>

      <div v-if="guestList.length">
        <template v-for="(guest) in guestList">
          <reservation-guest
              class="my-1"
              :key="guest.id"
              :guest="guest"
              :reservation="reservation"
              @updated="guestUpdated"
              @deleted="guestDeleted"
          >
          </reservation-guest>
        </template>
      </div>
      <v-alert v-else colored-border border="left" elevation="0" type="info">
        No other guests
      </v-alert>
    </div>
</template>

<script>
import ClipBoard from '../../../components/Utilities/ClipBoard.vue';
import ReservationGuest from '../Components/ReservationGuest.vue';
import ReservationGuestForm from '../Components/ReservationGuestForm.vue';

export default {
    name: "ReservationGuests",
    components: {
        ClipBoard, ReservationGuest, ReservationGuestForm
    },
    data() {
        return {
            guests: [],
            allGuests: [],
            createNew: false
        }
    },

    props: {
        reservation: Object,
        includePrimaryGuest: Boolean
    },

    computed: {
         reservationOwner() {
            return this.reservation.user_id === this.$store.getters.current_user.profile.id;
        },
        guestList() {
           return  this.guests.filter(guest => this.includePrimaryGuest ? true : guest.user_id != this.reservation.user_id)
        }
    },

    methods: {

        guestAdded(guest) {
            this.guests.unshift(guest);
            this.$emit('guests', this.guests);
        },

        guestUpdated(guest) {
            const index = this.guests.findIndex(g => g.id === guest.id);
            if (index>=0) this.guests.splice(index, 1, guest);
            this.$emit('guests', this.guests);
        },

        guestDeleted(guest) {
            const index = this.guests.findIndex(g => g.id === guest.id);
            if (index>=0) this.guests.splice(index, 1)
            this.$emit('guests', this.guests)
        }
    },

    watch: {
        reservation: {
            immediate: true,
            handler(reservation) {
                this.guests = reservation.guests ? reservation.guests : []
            }
        }
    }
}
</script>