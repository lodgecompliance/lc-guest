<template>
    <app-layer>
      <template #header>
        <v-row justify="center">
          <v-col md="10">
            <h4 class="headline">Reservation Checkin</h4>
          </v-col>
        </v-row>
      </template>

      <v-row justify="center">
        <v-col md="10">
          <v-card rounded color="transparent" flat>
            <v-card-text>
              <data-container :loading="loading" :error="error" @retry="getReservation">
                <template v-slot:loading>
                  <reservation-skeleton />
                </template>
                <!-- resource no longer loading but it not found -->
                <template v-if="reservation == null">
                  <div class="text-center">
                    <h4>We could not find that reservation</h4>
                    <p class="grey--text mt-5">check the url or contact your host</p>
                  </div>
                </template>

                <!-- the resource is found -->
                <template v-else-if="reservation">
                  <!-- If checkin date has passed and no one has checked in -->
                  <template v-if="!reservation.already_checkedin && checkoutPassed">
                    <div class="text-center">
                      <h4>The reservation checkin has expired</h4>
                      <p class="grey--text mt-5">Contact your host</p>
                    </div>
                  </template>

                  <!-- if the reservation already checked in and the there is no auhenticated user, checked in reservation should no longer be accessible by the public, as user to authenticate -->
                  <template v-else-if="reservation.already_checkedin && !current_user.auth">
                    <div class="text-center">
                      <h4>We discover that this reservation has been checked in, If it's for you, you can continue</h4>
                    </div>
                    <br>
                    <div class="text-center">
                      <v-btn  color="primary" @click="SET_AUTH_REQUIRED(true)" depressed>Continue</v-btn>
                    </div>
                  </template>

                  <!-- if the reserveation was not checked in by the cureent authenticated user -->
                  <template v-else-if="reservation.already_checkedin && current_user && reservation.user_id !== current_user.auth.uid">
                    <div class="text-center">
                      <h4>This reservation is already checked in by another guest</h4>
                      <p class="grey--text mt-5">check the url or contact your host</p>
                    </div>
                  </template>

                  <template v-else>
                    <v-row justify="center">
                      <template v-if="reservation.already_checkedin">
                        <v-col cols="12" md="4" class="px-0 px-md-2">
                          <reservation-timeline
                              :reservation="reservation"
                              dense
                              class="ml-n7 mt-n10"
                          />
                          <p>Thank you for booking with us at <strong>{{reservation.property.name}}</strong>. Below are the details of your bookings</p>
                          <h4>Reservation Details</h4>
                          <reservation-details :reservation="reservation" display-type="edge" />
                        </v-col>
                        <v-col cols="12" md="8" class="mt-md-n15 px-0 px-md-2">
                          <slot name="checkedin" v-bind="{ reservation, property }">
                            <reservation-instruction-expansion :reservation="reservation" />
                            <reservation-checkedin
                                :property="property"
                                :reservation="reservation"
                                class="mt-2"
                            />
                          </slot>
                        </v-col>
                      </template>
                      <v-col v-else md="12">
                        <v-row justify="center">
                          <v-col cols="12" md="4">
                            <template v-if="profile_loaded">
                              <h1 class="headline text-h4">Welcome,</h1>
                              <h3 class="headline text-h6">{{current_user.profile.first_name}} {{current_user.profile.last_name}}</h3>
                              <small class="grey--text">{{current_user.profile.email}}</small>
                            </template>
                            <p>Looking forward to hosting you at <strong>{{reservation.property.name}}</strong>. Below are the details of your bookings:</p>
                            <reservation-details :reservation="reservation" display-type="edge" />
                            <v-btn
                                  v-if="!canStart"
                                  text
                                  dark color="accent-4"
                                  class="primary mt-5"
                                  block
                                  @click="getStarted"
                                  :loading="starting"
                                  :disabled="starting"
                              >
                                Start Checkin
                              </v-btn>
                          </v-col>
                          <v-col v-if="canStart" cols="12" md="8" >
                            <reservation-checkin
                                :property="property"
                                :reservation="reservation"
                                :startAgainPath="startPath"
                                @verification="verificationAvailable"
                                @charges-payment="chargesPayment"
                                @checkedin="reservationCheckedin"
                                @cancel="reservationCheckinCancelled"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </template>
                </template>
              </data-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </app-layer>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

import AppLayer from '@/AppLayer';
import DataContainer from '@/components/DataContainer.vue';
import ReservationDetails from '../Components/ReservationDetails';
import ReservationCheckin from '../Widgets/Checkin/Index';
import ReservationCheckedin from '../Widgets/CheckedIn';
import ReservationSkeleton from '../Components/ReservationSkeleton';

import GET_RESERVATION from '../Queries/getReservation';
import reservationMixin from '../Mixins/reservation';
import ReservationTimeline from "@/domain/Reservation/Components/ReservationTimeline";
import session from "@/domain/Reservation/Mixins/session";
import ReservationInstructionExpansion from "@/domain/Reservation/Components/ReservationInstructionExpansion.vue";

export default {
  name: 'ReservationPage',
  mixins: [ reservationMixin, session ],
  components: {
    ReservationInstructionExpansion,
    ReservationTimeline,
    AppLayer,
    DataContainer,
    ReservationDetails,
    ReservationCheckin,
    ReservationCheckedin,
    ReservationSkeleton,
  }, 
  data(){
      return {
        loading: false,
        error: null,
        start: false,
        starting:false,
        reservation: null,
      }
  },

    computed:{
      ...mapGetters([
          'authenticated',
          'current_user',
          'profile_loaded',
          'checkin',
      ]),

      id(){
          return this.$route.params.reservation
      },

      canStart() {
          return this.start || this.$route.query.start == 1
      },

      startPath() {
          return this.$router.resolve({
            name: this.$route.name,
            query: { source: this.$route.query.source, session: this.checkin_session.session?.id || undefined, start: 1 }
          }).route.fullPath
      },
    },
  
  methods:{
    ...mapActions([
        'query',
    ]),
    ...mapMutations([
      'SET_CURRENT_PROPERTY',
      'SET_CHECKIN_SESSION_RESERVATION',
      'SET_AUTH_REQUIRED'
    ]),

    getStarted() {
        this.start = true
        // this.setSession()
        //     .then(() => this.start = true)
        //     .finally(() => this.starting = false )
    },

    verificationAvailable(verification){

    },

    chargesPayment(charges){

    },

    reservationCheckedin(checkin){
      this.getReservation();
      if(window.top) {
        window.top.postMessage({ type: "checkedin", data: checkin }, "*");
      }
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
          this.reservation = response?.data?.getReservation;
          if(this.reservation) {
            this.SET_CHECKIN_SESSION_RESERVATION(response.data.getReservation);
            this.SET_CURRENT_PROPERTY(this.reservation.property);
            if(this.canStart) return this.setSession()
          }
        })
        .catch(e => this.error = e)
        .finally(() => this.loading = false)
    },
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.getReservation()
      }
    }
  }

}
</script>
