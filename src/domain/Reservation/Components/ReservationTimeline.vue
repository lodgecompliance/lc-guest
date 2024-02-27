<template>
  <v-timeline
      align-top
      dense
  >
    <v-timeline-item
        v-for="(item, i) in timelineItems"
        :key="i"
        :color="item.color"
        small fill-dot
    >
      <template #icon >
        <v-icon color="white" small>
          {{ item.color === 'success' ? 'mdi-check' : 'mdi-alert' }}
        </v-icon>
      </template>
      <v-sheet color="transparent" class="ml-n6">
        <h4 :class="`${item.color}--text`">
          {{item.title}}
        </h4>
        <small v-if="item.moment" class="grey--text">
          {{ item.moment.format('MMMM Do YYYY, hh:mm a') }}, {{ item.moment.fromNow() }}
        </small>
      </v-sheet>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import reservationMixin from '../Mixins/reservation';

export default {
  name: "ReservationTimeline",
  mixins: [reservationMixin],
  props: {
    reservation: Object
  },

  computed: {
    timelineItems() {
      const items = [];
      items.push({
        moment: this.createdAtMoment,
        color: "success",
        title: "Reservation created",
        description: `Reservation created for ${this.reservation.name} by ${this.reservation.created_by ? [this.reservation.created_by.first_name, this.reservation.created_by.first_name].join(" ") : "host"}`
      })
      if(this.reservation.checkedin) {
        items.push({
          moment: this.checkedinAtMoment,
          color: "success",
          title: "Reservation checked in",
          description: `Reservation was checked in by ${this.reservation.user ? [this.reservation.user.first_name, this.reservation.user.first_name].join(" ") : 'guest' }`
        })
      } else {
        items.push({
          color: "warning",
          title: "Awaiting checkin",
          description: `Waiting for ${this.reservation.name} to checkin to the reservation`
        })
      }
      if(this.reservation.approved) {
        items.push({
          moment: this.approvedAtMoment,
          color: "success",
          title: "Reservation checkin approved",
          description: `Reservation checkin was approved by ${this.reservation.approved_by ? [this.reservation.approved_by.first_name, this.reservation.approved_by.last_name].join(" ") : 'host'}`
        })
      } else {
        items.push({
          color: "warning",
          title: "Awaiting checkin approval",
          description: `Waiting for checkin information to be approved`
        })
      }

      if(this.reservation.checkedout) {
        items.push({
          moment: this.checkedoutAtMoment,
          color: "success",
          title: "Reservation checked out",
          description: `Reservation checked out by ${ this.reservation.checkedout_by ? [this.reservation.checkedout_by.first_name, this.reservation.checkedout_by.last_name].join(" ") : 'host'}`
        })
      } else {
        items.push({
          moment: this.checkoutMoment,
          color: "warning",
          title: "Awaiting checkout",
        })
      }

      if(this.reservation.cancelled) {
        items.push({
          moment: this.cancelledAtMoment,
          color: "red",
          title: "Reservation cancelled",
          description: `Reservation cancelled by ${ this.reservation.cancelled_by ? [this.reservation.cancelled_by.first_name, this.reservation.cancelled_by.first_name].join(" ") : 'host'}`
        })
      }
      return items;
    }
  }
}
</script>

