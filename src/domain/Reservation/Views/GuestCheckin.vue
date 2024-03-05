<template>
    <app-layer ref="app">
        <template #header>
          <v-row justify="center">
            <v-col cols="12" md="10">
              <h4 class="headline">Reservation Guest Confirmation</h4>
            </v-col>
          </v-row>
        </template>
        <data-container :loading="loading" :error="error" @retry="getReservation">
            <template v-slot:loading>
                <reservation-skeleton />
            </template>
            <!-- resource no longer loading but it not found -->
            <template v-if="reservation == null">
              <v-row justify="center">
                <v-col xs="12" md="10">
                  <v-sheet class="pa-3" rounded>
                    <div class="text-center">
                      <h2>We could not find that reservation</h2>
                      <p>check that the url is valid or contact your host</p>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

            </template>

            <!-- the resource is found -->
            <template v-else-if="reservation">
                <!-- if the reservation already checked in and the there is no auhenticated user, checked in reservation should no longer be accessible by the public, as user to authenticate -->
                <template v-if="!reservation.already_checkedin">                    
                    <v-container>
                        <v-row justify="center">
                            <v-col xs="12" md="10">
                                <v-sheet class="pa-3" rounded>
                                    <div class="text-center">
                                        <h4>Reservation has not been checked by primary guest</h4>
                                    </div>
                                    <div class="text-center mt-5">
                                        <router-link :to="{name: 'reservation.show', params: {id: reservation.id }}">
                                            <v-btn color="primary">Checkin as Primary Guest</v-btn>
                                        </router-link>
                                    </div>
                                </v-sheet>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>

                <template v-else>
                    <v-row justify="center">
                        <v-col cols="12" md="10">
                            <v-sheet class="pa-3" rounded>
                                <v-row justify="center">
                                    <v-col cols="12" md="4" >
                                        
                                        <div class="text-center">
                                            <v-avatar v-if="property" color="primary" size="150">
                                                <v-img
                                                :src="property.image"
                                                ></v-img>

                                            </v-avatar>
                                            <h4>{{reservation.property.name}}</h4>
                                            <p class="grey--text">{{property ? property.full_address : reservation.property.address}}</p>
<!--                                            <div class="my-3">-->
<!--                                                    <v-btn text-->
<!--                                                        :to="{name: 'property.show', params: { property: reservation.property.id, _property: reservation.property} }"-->
<!--                                                        color="primary">View property</v-btn>-->
<!--                                            </div>-->
<!--                                            <router-link-->
<!--                                                :to="{name: 'property.rules', params: { property: reservation.property.id, _property: reservation.property} }"-->
<!--                                                class="text-decoration-none">-->
<!--                                                Property Rules-->
<!--                                            </router-link>-->
                                        </div>
                                        
                                        <template v-if="reservation.already_checkedin">
                                            <v-alert 
                                                border="left"
                                                colored-border
                                                type="success">
                                                Reservation checked in {{reservation.checkedin_at | timestamp_to_date('day mName, year. diff')}}
                                            </v-alert>                                            
                                        </template>
                                    </v-col>

                                    <v-col cols="12" md="8">
                                        <v-card outlined class="my-2">
                                            <v-card-text>
                                              <p class="grey--text mb-0">Reservation owner</p>
                                              <h4 class="headline mt-0">{{ [primaryGuest.first_name, primaryGuest.last_name].join(' ') }}</h4>
                                              <reservation-details :reservation="reservation" :show-only="['checkin_date', 'checkout_date']" />
                                            </v-card-text>
                                        </v-card>

                                        <v-alert
                                            v-if="alreadyCheckedin"
                                            border="left"
                                            colored-border
                                            type="success"
                                            >
                                                Already confirmed as {{ alreadyCheckedin.name }}
                                        </v-alert>

                                         <v-alert
                                            v-else-if="checkoutPassed"
                                            border="left"
                                            colored-border
                                            type="error" prominent
                                            >
                                            Reservation checkout elapsed
                                        </v-alert>

                                          <template v-else-if="!canStart || !start">
                                              <template v-if="guests.length">
                                                  <reservation-guest-select
                                                      outlined
                                                      item-text="name"
                                                      :reservation="reservation"
                                                      v-model="guest"
                                                      label="Select who you are checkin in as"
                                                  />
                                                <div class="my-5 text-center">
                                                  <v-btn
                                                      v-if="guest"
                                                      text
                                                      dark color="accent-4"
                                                      class="primary"
                                                      @click="getStarted"
                                                  >
                                                    Continue to checkin as {{ guest.name }}
                                                  </v-btn>
                                                </div>
                                              </template>
                                              <v-alert
                                                  v-else
                                                  border="left"
                                                  colored-border
                                                  type="error"
                                              >
                                                  No guest was added to the reservation
                                              </v-alert>
                                          </template>

                                          <template v-else>
                                            <div class="d-flex align-center my-3">
                                                <v-btn icon @click="start = false">
                                                    <v-icon>mdi-arrow-left</v-icon>
                                                </v-btn>
                                                <p class="ma-0 ml-2">Checkin in as {{ guest.name }}</p>
                                            </div>

                                            <reservation-guest-checkin
                                            :property="property"
                                            :reservation="reservation"
                                            :guest="guest"
                                            :primary-guest="primaryGuest"
                                            :startAgainPath="startPath"
                                            @checkedin="guestCheckedIn"
                                            />
                                        </template>
                                    </v-col>
                                </v-row>
                            </v-sheet>
                        </v-col>
                    </v-row>
                </template>
            </template>

        </data-container>
    </app-layer>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex';
import { auth } from '@/firebase';

import AppLayer from '@/AppLayer';
import DataContainer from '../../../components/DataContainer.vue';
import ReservationSkeleton from '../Components/ReservationSkeleton';
import ReservationGuestSelect from '../Components/ReservationGuestSelect.vue';
import ReservationGuestCheckin from '../Widgets/Checkin/GuestCheckin.vue';
import ReservationDetails from "@/domain/Reservation/Components/ReservationDetails";

import reservationMixin from '../Mixins/reservation';

import GET_RESERVATION from '../Queries/getReservation';

export default {
  name: 'Reservation',
  mixins: [reservationMixin],
  components: {
      AppLayer,
      DataContainer,
      ReservationSkeleton,
      ReservationGuestSelect,
      ReservationGuestCheckin,
      ReservationDetails
  }, 
  data(){
      return {
        loading: false,
        start: false,
        reservation: null,
        guest: null,
        error: null,
      }
  },

    computed:{
        ...mapGetters([
            'authenticated',
            'current_user',
            'profile_loaded'
        ]),

        id(){
            return this.$route.params.reservation
        },

        canStart() {
            return this.start || this.$route.query.start == 1
        },

        startPath(){
            return this.$router.resolve({
                name: this.$route.name,
                query: {
                    start: 1,
                    guest: this.guest ? this.guest.id : undefined
                }
            }).route.fullPath
        },

        primaryGuest() {
            if(!this.reservation) return null;
            return this.reservation.user
        },

        allGuests() {
            return  this.reservation ? this.reservation.guests : []
        },

        guests() {
            const guests = this.reservation ? this.reservation.guests : [];
            return guests.filter(g => g.user_id !== this.reservation.user_id);
        },

        alreadyCheckedin() {
            return this.allGuests.find(guest => guest.user_id === this.current_user.profile.id);
        }

    },
  
  methods:{
    ...mapActions([
        'query',
    ]),
    ...mapMutations([
        'SET_CURRENT_PROPERTY'
    ]),

    getStarted(){
        this.start = true;
    },

    reservationCheckinCancelled() {
        this.start = false;
    },

    getReservation(){
        this.loading = true;
        this.error = null;
        this.query({
            query: GET_RESERVATION,
            variables: {
                id: this.id
            }
        })
        .then(response => {
            if(response && response.data.getReservation){
              this.reservation = response.data.getReservation;
              this.SET_CURRENT_PROPERTY(this.reservation.property);
            }
           if(this.$route.query.guest) {
             this.guest = this.reservation.guests.find(g => g.id === this.$route.query.guest);
           }
        })
        .catch(e => {
            this.error = e
        })
        .finally(() => {
            this.loading = false;
        })
    },

    guestCheckedIn() {
        this.$router.replace({
            name: this.$route.name
        });
        this.getReservation();
    }

  },
  mounted(){
    this.getReservation()
  },

}
</script>
