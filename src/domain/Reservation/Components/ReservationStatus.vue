<template>
  <span>
    <slot v-bind="{ status }">
      <v-chip
        :color="status.color"
        dark
        small
        outlined
      >
        {{ status.label }}
      </v-chip>
    </slot>
    </span>
</template>

<script>
export default {
    name: "ReservationStatus",
    data() {
      return {
        statuses: {
          pending: {
            label: "Pending",
            color: "warning"
          },
          checked_in: {
            label: "Checked in",
            color: "info"
          },
          checkin_approved: {
            label: "Checkin Approved",
            color: "success"
          },
          checked_out: {
            label: "Checked out",
            color: "grey"
          },
          expired: {
            label: "Expired",
            color: "red"
          },
          cancelled: {
            label: "Cancelled",
            color: "red"
          }
        }
      }
    },
    computed:{
        status(){
          if(this.reservation.status && this.statuses[this.reservation.status]){
            return this.statuses[this.reservation.status]
          }
          return {
            label: "N/A",
            color: "primary"
          }
      }
    },
    props: {
        reservation: Object
    }
}
</script>