<template>
  <v-card flat>
    <v-toolbar
        color="primary"
        dark
        flat
    >
      <v-menu transition="slide-x-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon
              v-bind="attrs"
              v-on="on"></v-app-bar-nav-icon>
        </template>
        <v-list>
          <v-list-item
              v-for="tab in tabs"
              :key="tab.label"
              :to="tab.route"
          >
            <v-list-item-title v-text="tab.label"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-toolbar-title>{{ reservation.name  }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
          color="primary"
          small outlined
          class="mb-3"
          @click="$refs.contract.open()" text>View Contract</v-btn>
    </v-toolbar>
    <reservation-checkin-contract
        ref="contract"
        :checkin="checkin"
        :property="property"
        :reservation="reservation"
        :pdfable="true"
    />
    <data-container :loading="loading">
      <slot v-if="checkin" v-bind="{ checkin, getReservationCheckin }" />
    </data-container>
  </v-card>
</template>

<script>
 import GET_RESERVATION_CHECKIN from '../Queries/getReservationCheckin';
 import DataContainer from "@/components/DataContainer.vue";
 import ReservationCheckinContract from "@/domain/Reservation/Widgets/Checkin/ReservationCheckinContract.vue";
    export default {
        name: "ReservationCheckedinPage",
        components: {ReservationCheckinContract, DataContainer},

        data(){
            return {
                loading: true,
                currentTab: 1,
                tabs: [
                  {
                    label: "Guests",
                    route: { name: "reservation.guests", params: { reservation: this.reservation.id } }
                  },
                  {
                    label: "ID Verification",
                    route: { name: "reservation.id-verification", params: { reservation: this.reservation.id } }
                  },
                  {
                    label: "Charges",
                    route: { name: "reservation.charges", params: { reservation: this.reservation.id } }
                  },
                  {
                    label: "Damages",
                    route: { name: "reservation.damages", params: { reservation: this.reservation.id } }
                  },
                  {
                    label: "Documents",
                    route: { name: "reservation.documents", params: { reservation: this.reservation.id } }
                  }
                ],
                checkin: null,
            }
        },
        props: {
            reservation: Object,
            property: Object,
        },

        methods: {
            getReservationCheckin(){
                this.loading = true;
                this.$store.dispatch('query',{
                    query: GET_RESERVATION_CHECKIN,
                    variables: {
                        id: this.reservation.id
                    }
                })
                .then(response => {
                    this.checkin = response.data.getReservationCheckin;
                    if(!this.checkin.user){
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: "The user account that checked in no longer exist",
                            color: "error"
                        })
                    }
                })
                .catch(e => {
                    this.$store.commit("TOAST_ERROR", {
                        show: true,
                        message: `Could not get reservation checkin information.`,
                        retry: () => this.getReservationCheckin(),
                        exception: e
                    });
                })
                .finally(() => {
                    this.loading = false;
                })
            },
        },
        watch: {
            $route: {
              immediate: true,
              handler(route) {
                this.currentTab = this.tabs.findIndex(tab => tab.route.name === route.name)
              }
            },
            reservation: {
                immediate: true,
                handler(reservation){
                    if(reservation){
                        this.getReservationCheckin();
                    }
                }
            }
        }
    }
</script>

