<template>
  <div>
    <v-dialog v-model="damageReport" width="400">
      <reservation-damage-form
          :reservation="reservation"
          @cancel="damageReport = false"
          @damage-reported="damageReport = false"
      />
    </v-dialog>
    <v-menu origin="center center"  transition="scale-transition">
      <template v-slot:activator="{ on }">
        <v-btn v-bind="$attrs.activator" icon v-on="on">
          <v-icon v-bind="$attrs.activatorIcon">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
            v-if="$route.name !== 'reservation.show'"
            :to="{ name: 'reservation.show', params:  { reservation: reservation.id, _reservation: reservation }}"
        >
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-eye</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View Reservation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="damageReport = true">
          <v-list-item-icon class="mr-2">
            <v-icon>mdi-alert</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Report Damage</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import reservationMixin from '../Mixins/reservation';
  import ReservationDamageForm from "@/domain/Reservation/Components/ReservationDamageForm";

  export default {
    name: "ReservationGuestOptions",
    mixins: [reservationMixin],
    components: {ReservationDamageForm },
    data() {
      return {
        damageReport: false
      }
    },
    computed: {
        items() {
          let items = [
              {
                name: "report.damage",
                title: "Report damage",
                icon: "mdi-eye"
              }
          ]
          if(this.$route.name !== 'reservation.show') {
            items.unshift({
              name: "view.reservation",
              title: "View Reservation",
              icon: "mdi-eye"
            })
          }
          return items;
        }
    },
    props: {
        reservation: Object
      },
    }
</script>

