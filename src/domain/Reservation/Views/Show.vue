<template>
    <app-layer>
      <v-row justify="center">
        <v-col md="10">
          <v-card rounded color="transparent" flat>
            <v-card-text class="px-0">
              <data-container :loading="loading" :error="error" @retry="getReservation">
                <template v-slot:loading>
                  <reservation-skeleton />
                </template>
                <!-- resource no longer loading but it not found -->
                <template v-if="!reservation">
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
                  <template v-else>
                    <v-row justify="center">
                      <template v-if="reservation.already_checkedin">
                        <v-col cols="12" md="4" class="px-0 px-md-2">
                          <reservation-details :reservation="reservation" display-type="edge" />
                          <reservation-timeline
                              :reservation="reservation"
                              dense
                          />
                        </v-col>
                        <v-col cols="12" md="8" class="px-0 px-md-2">
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
                            <h2 class="headline text-center">Booking Details</h2>
                            <v-card rounded flat>
                              <v-card-text>
                                <reservation-details :reservation="reservation" display-type="edge" />
                              </v-card-text>
                              <v-card-actions>
                                <v-btn
                                    v-if="!canStart"
                                    depressed block
                                    class="primary"
                                    @click="getStarted"
                                    :loading="starting"
                                    :disabled="starting"
                                >
                                  Start Checkin
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-col>
                          <v-col cols="12" md="6" v-if="canStart">
                            <reservation-checkin
                                :property="property"
                                :reservation="reservation"
                                :startAgainPath="startPath"
                                @checkedin="reservationCheckedin"
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
import ReservationCheckedin from '../Widgets/CheckedIn';
import ReservationSkeleton from '../Components/ReservationSkeleton';

import GET_RESERVATION from '../Queries/getReservation';
import reservationMixin from '../Mixins/reservation';
import ReservationTimeline from "@/domain/Reservation/Components/ReservationTimeline";
import session from "@/domain/Reservation/Mixins/session";
import ReservationInstructionExpansion from "@/domain/Reservation/Components/ReservationInstructionExpansion.vue";
import ReservationCheckin from "@/domain/Reservation/Widgets/Checkin/Index.vue";

export default {
  name: 'ReservationPage',
  mixins: [ reservationMixin, session ],
  components: {
    ReservationCheckin,
    ReservationInstructionExpansion,
    ReservationTimeline,
    AppLayer,
    DataContainer,
    ReservationDetails,
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
          'auth',
      ]),
      id(){
          return this.$route.params.reservation
      },
      canStart() {
          return this.$route.query.start == 1
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
      'SET_AUTH_PARAM'
    ]),
    getStarted() {
      return this.$router.replace({
        ...this.$route,
        query: { ...this.$route.query, start: 1 }
      })
    },
    getReservation(){
        this.loading = true;
        this.error = null;
        this.query({
            query: GET_RESERVATION,
            authRequired: false,
            variables: {
                id: this.id
            }
        })
        .then(response => {
          this.reservation = response?.data?.getReservation;
          if(this.reservation) {
            this.SET_CHECKIN_SESSION_RESERVATION(response.data.getReservation);
            this.SET_CURRENT_PROPERTY(this.reservation.property);
          }
        })
        .catch(e => this.error = e)
        .finally(() => this.loading = false)
    },
    reservationCheckedin(checkin){
      this.getReservation();
      if(window.top) {
        window.top.postMessage({ type: "checkedin", data: checkin }, "*");
      }
    },
  },
  watch: {
    current_user: {
      immediate: true,
      handler(user) {
        if(user.auth?.uid && this.canStart) this.setSession();
      }
    },
    id: {
      immediate: true,
      handler() {
        this.getReservation()
      }
    },
    reservation: {
      immediate: true,
      handler(r) {
        if(!r) return;
        this.SET_AUTH_PARAM({ key:  'idVerification', value: r.require_id_verification ? 1 : 0 })
        this.SET_AUTH_PARAM({ key:  'reservationId', value: r.id })
      }
    }
  }

}
</script>
