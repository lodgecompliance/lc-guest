<template>
    <div>
        <template v-if="canStart" >
            <v-stepper v-model="currentStep" vertical >
                <template v-for="(step, i) in steps">
                    <template v-if="step.id === 'guest-info'">
                        <v-stepper-step
                            :key="`step-${step.id}`"
                            :complete="step.completed"
                            :step="(i+1)"
                            :editable="currentStep >= (i+1)"
                            edit-icon="mdi-account"
                        >
                        Guest Info
                        </v-stepper-step>
                        <v-stepper-content
                        :key="`step-content-${step.id}`"
                        :step="(i+1)">
                            <v-card>
                                <v-card-text>
                                  <guest-info :property="property" @submit="(info) => currentStep++" >
                                    <template #submit-guest="{ submit }">
                                      <div class="text-right">
                                        <v-btn color="primary" @click="submit()">Continue</v-btn>
                                      </div>
                                    </template>
                                  </guest-info>
                                </v-card-text>
                            </v-card>
                        </v-stepper-content>
                    </template>

                    <!-- ID verification -->
                    <template v-if="step.id === 'id-verification'">
                        <v-stepper-step
                            :key="`step-${step.id}`"
                            :complete="verificationSubmitted"
                            :step="(i+1)"
                            :editable="currentStep >= (i+1)"
                            edit-icon="mdi-account-check"
                        >
                        Personal Information
                        </v-stepper-step>

                        <v-stepper-content
                        :key="`step-content-${step.id}`"
                        :step="(i+1)">
                            <reservation-id-verification
                            :reservation="reservation"
                            :property="property"
                            :callback-url="startAgainPath"
                            @verification="verificationReceived"
                            @completed="currentStep++"
                            ref="idVerification"
                            />
                        </v-stepper-content>
                    </template>

                    <!-- Contract -->
                    <template v-if="step.id === 'contract'">
                        <v-stepper-step
                        :key="`step-${step.id}`"
                        :step="(i+1)"
                        :editable="currentStep >= (i+1)"
                        edit-icon="mdi-credit-card"
                        >
                            Signature
                        </v-stepper-step>

                        <v-stepper-content
                        :key="`step-content-${step.id}`"
                        :step="(i+1)">
                            <p>By appending the signature, I agree I am <strong>{{ guest.name }}</strong> and affilitated to <strong>{{ [primaryGuest.first_name, primaryGuest.last_name].join(' ') }}</strong> reservation at {{ property.name }}</p>
                            
                            <signature-pad :editable="reservation.already_checkedin" :activate="true" v-model="signature" />

                            <error-handler :error="checkinError" @retry="finalizeCheckin" />
                            <v-btn class="mt-3" :loading="checkingin" @click="finalizeCheckin" color="primary" :disabled="!step.completed">Finalize</v-btn>
                        </v-stepper-content>
                    </template>

                </template>                
            </v-stepper>

        </template>
    </div>
</template>

<script>
import {mapActions, mapMutations} from 'vuex';
import ReservationIdVerification from './ReservationIDVerification.vue';
import SignaturePad from '../../../../components/Utilities/SignaturePad.vue';
import GuestInfo from './GuestInfo.vue';

import CHECKIN_RESERVATION_GUEST from '../../Mutations/checkinReservationGuest';
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "ReservationGuestCheckin",
    components: {
      ErrorHandler,
       ReservationIdVerification,
       SignaturePad, GuestInfo
    },
    props: {
        property: Object,
        reservation: Object,
        guest: Object,
        primaryGuest: Object,
        startAgainPath: String
    },
    data(){
        return {
            canStart: false,
            info: null,
            verification: null,
            signature: null,
            currentStep: 1,
            checkingin: false,
            checkinError: null
        }
    },

    computed: {
        steps() {
          const steps = [];
          if(!this.reservation || !this.guest) return steps;

          if(this.reservation.require_id_verification && this.guest.can_verify_id) {
            steps.push({
              id: 'id-verification',
              completed: this.verificationSubmitted
            })
          }
          steps.push({
            id: 'guest-info',
            completed: this.infoSubmited
          });

          steps.push({
              id: 'contract',
              completed:  this.contractSigned
          })

          return steps;
        },

        infoSubmited() {
            return this.info !== null
        },

        verificationSubmitted(){
          return this.verification !== null;
        },

        contractSigned() {
            return this.signature !== null;
        },

        approved(){
            return this.reservation.approved
        }
    },

    methods: {
      ...mapMutations([
        'SET_AUTH_REQUIRED'
      ]),

      ...mapActions([
          'mutate'
      ]),

        verificationsFetched(verifications){
            if(verifications){
                const reservationIdVerifications = verifications.filter(v => v.metadata.reservation_id === this.reservation.id);
                if(reservationIdVerifications.length){
                    this.verification = reservationIdVerifications.pop();
                    this.$emit('verification', this.verification);
                }
            }
        },

        verificationReceived(verification) {
            this.verification = verification;
        },

        finalizeCheckin(){
            this.checkingin = true;
            this.checkinError = null;
            const verification = {...this.verification};
            const info = { ...this.info };
            info.name = undefined;
            // Remove the result object from the smile verification object
            if(verification && verification.smile && verification.smile.result) {
                verification.smile.result = undefined
            }
            if(verification && verification.upload && verification.upload.verified_by) {
              verification.upload.verified_by = {
                property_id: verification.upload.verified_by.property
                    ? verification.upload.verified_by.property.id
                    : null,
                user_id: verification.upload.verified_by.user
                    ? verification.upload.verified_by.user.id
                    : null
              }
            }
            this.mutate({
                mutation: CHECKIN_RESERVATION_GUEST,
                variables: {
                    reservation_id: this.reservation.id,
                    guest_id: this.guest.id,
                    verification, info,
                    signature: this.signature,
                }
            })
            .then(response => {
                if(response.data.checkinReservationGuest){
                    const guest = response.data.checkinReservationGuest;
                    // this.$store.commit('ADD_USER_RESERVATION', {...this.reservation});
                    this.$emit('checkedin', guest);
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: 'Checkin successful',
                        color: 'success'
                    })
                }else{
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: 'Checkin could not be finalized. Try again',
                        color: 'error'
                    })
                }
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.checkingin = false;
            })
        },
    },

    watch: {
        reservation: {
            immediate: true,
            handler(){
              this.SET_AUTH_REQUIRED(!this.canStart)
            }
        },
        guest: {
            immediate: true,
            handler(guest) {
                this.info = {
                    name: guest.name,
                }
            }
        }
    }

}
</script>