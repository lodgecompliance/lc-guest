<template>
    <data-container :loading="loading" :error="error" @retry="getUserReservations">
        <template v-slot:loading>
            <v-row>
                <v-col cols="12" sm="6" md="4" v-for="i in 6" :key="i">
                    <reservation-card-skeleton class="ma-2" />
                </v-col>
            </v-row>
        </template>
        <v-row v-if="reservations.length">
            <v-col v-for="reservation in reservations"  :key="reservation.id"
            cols="12" sm="6" md="4">
                <user-reservation :_reservation="reservation" class="my-2" />
            </v-col>
        </v-row>
        <template v-else >
          <slot name="no-reservations">
            <p class="grey--text text-center">No reservation yet</p>
          </slot>
        </template>
    </data-container>
</template>

<script>
import DataContainer from '../../../components/DataContainer';
import UserReservation from '../Components/Reservation';
import ReservationCardSkeleton from '../Components/ReservationCardSkeleton';

import GET_USER_RESERVATIONS from '../Queries/getUserReservations';

export default {
    name: "UserReservations",
    components: {
        DataContainer, UserReservation, 
        ReservationCardSkeleton
    },
    data(){ 
        return {
            loading: false,
            error: null,
            reservations: [],
        }
    },
    props: {
        user: Object,
        includes: Array
    },
    methods: {
        getUserReservations(){
            this.loading = true;
            this.error = null;
            this.$store.dispatch('query', {
                query: GET_USER_RESERVATIONS,
                variables: {
                  id: this.user.id,
                  includes: this.includes
                }
            })
            .then(response => {
                this.reservations = response.data.getUserReservations ? response.data.getUserReservations.data : []
            })
            .catch(e => {
                this.error = e;
            })
            .finally(() => {
                this.loading = false;
            })
        },
    },

    watch: {
      user: {
        immediate: true,
        handler() {
          this.getUserReservations()
        }
      },
      includes: {
        immediate: false,
        handler() {
          this.getUserReservations()
        }
      }
    }
}
</script>