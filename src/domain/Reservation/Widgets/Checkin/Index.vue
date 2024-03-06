<template>
    <section>
        <h4 class="my-2">Checkin</h4>
        <p>Kindly complete your checkin process</p>
        <template v-if="canStart" >
          <responsive-stepper flat @change="stepChanged" :step="currentStep" style="box-shadow: none">
            <template v-for="(step, i) in steps">
              <!-- ID verification -->
              <template v-if="step.id === 'id-verification'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :complete="verificationSubmitted"
                    :step="(i+1)"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-account-check"
                >
                  ID Verification
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <div class="pa-1">
                    <reservation-id-verification
                        v-if="currentStep === (i+1)"
                        :user-id="current_user.profile.id"
                        @verification="verificationReceived"
                        ref="idVerification"
                    >
                      <template #default="{ loading, verification }">
                        <v-card-text v-if="verification">
                          Your ID verification will be shared with {{ property.name }}
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" @click="currentStep++" :disabled="loading" depressed>Continue</v-btn>
                        </v-card-actions>
                      </template>
                    </reservation-id-verification>
                  </div>
                </v-stepper-content>
              </template>

              <!-- Guest -->
              <template v-if="step.id === 'guest'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :step="(i+1)"
                    :complete="guestsAvailable"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-account-group"
                >
                  Guests
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <v-card class="pa-1" flat>
                    <v-card-text>
                      <reservation-guest
                          v-if="currentStep === (i+1)"
                          :property="property"
                          :reservation="reservation"
                          @guests="guestsReceived"
                          @continue="(guests) => {
                                        guestsReceived(guests);
                                        currentStep++
                                    }"
                      />
                    </v-card-text>
                    <v-card-actions v-if="reservation.allow_additional_guest">
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="currentStep++" :disabled="!step.completed" depressed>Continue</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-stepper-content>
              </template>

              <!-- Questions -->
              <template v-if="step.id === 'questions'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :complete="questionsRespondedTo"
                    :step="(i+1)"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-account-question"
                >
                  Questions
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <v-card class="pa-1" flat>
                    <v-card-text>
                      <p>The following questions have been required to be answered for your checkin</p>
                      <reservation-questions
                          v-if="currentStep === (i+1)"
                          :questions="reservation.questions"
                          @responses="questionResponded" />
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="currentStep++" :disabled="!step.completed" depressed>Continue</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-stepper-content>
              </template>

              <!-- Agrements -->
              <template v-if="step.id === 'agreements'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :complete="agreementsAgreed"
                    :step="(i+1)"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-handshake"
                >
                  Agreements
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <v-card class="pa-1" flat>
                    <v-card-text class="pa-0">
                      <p>You need to agree to the following. Checking the boxes means you agree to each item</p>
                      <reservation-agreements
                          v-if="currentStep === (i+1)"
                          :agreements="allReservationAgreements"
                          @agreement="aggrementsResolved">
                        <template #default="{ agreement }">
                          <v-alert v-if="agreement.question"
                                   border="left"
                                   colored-border
                                   type="info"
                          >
                            Because you responded <strong>{{ agreement.question.response.option }}</strong>  to <strong>{{ agreement.question.question }}</strong>
                          </v-alert>
                        </template>
                      </reservation-agreements>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="currentStep++" :disabled="!step.completed" depressed>Continue</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-stepper-content>
              </template>

              <!-- Payment -->
              <template  v-if="step.id === 'payment'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :step="(i+1)"
                    :complete="allPaymentMade"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-credit-card"
                >
                  Payment
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1 py-0"
                >
                  <div class="pa-1">
                    <reservation-charges
                        v-if="currentStep === (i+1)"
                        :reservation="reservation"
                        :guests="guests"
                        :property="property"
                        :submitted-credit-card="credit_card"
                        @charges-payment="chargesPayment"
                        @credit-card="creditCardReceived"
                        :can-pay="true"
                        :attachments="attachedCharges"
                        :fetch-payments="true"
                        :capture-pre-authorize="capturePreAuthorize"
                    >

                      <template #label="{ allChargesPaid }">
                        <p v-if="!allChargesPaid" class="grey--text">Select charges to pay</p>
                      </template>

                      <template #default="{ charge, payment }">

                        <template v-if="charge.type === 'pre-authorize'">
                          <v-alert v-if="!payment || (payment && !payment.captured)"
                                   border="left"
                                   colored-border
                                   type="info"
                          >
                            <span v-if="capturePreAuthorize">This charge is refundable</span>
                            <span v-else>This is a pre authorized charge.
                              {{ property.name }} will capture the charge later.
                            </span>
                          </v-alert>
                        </template>
                      </template>
                    </reservation-charges>
                    <div class="d-flex justify-end mt-5">
                      <v-btn color="primary" @click="currentStep++" :disabled="!step.completed" depressed>Continue</v-btn>
                    </div>
                  </div>
                </v-stepper-content>
              </template>

              <!-- Credit card -->
              <template  v-if="step.id === 'credit-card'">
                <v-stepper-step
                    :key="`step-${step.id}`"
                    :step="(i+1)"
                    :complete="creditCardCollected"
                    :editable="currentStep >= (i+1)"
                    edit-icon="mdi-credit-card"
                >
                  Credit Card
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <div class="pa-1">
                    <reservation-checkin-credit-card
                        v-if="currentStep === (i+1)"
                        :reservation="reservation"
                        :property="property"
                        @credit-card="creditCardReceived"
                    />
                    <div class="d-flex justify-end mt-5">
                      <v-btn color="primary" @click="currentStep++" :disabled="!step.completed" depressed>Continue</v-btn>
                    </div>
                  </div>
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
                  Contract
                </v-stepper-step>
                <v-stepper-content
                    :key="`step-content-${step.id}`"
                    :step="(i+1)"
                    class="px-1 mr-1"
                >
                  <reservation-contract-signature
                      v-if="currentStep === (i+1) && steps.filter(s => s.id !== 'contract').every(s => s.completed)"
                      v-on="$listeners"
                      :property="property"
                      :reservation="reservation"
                      :start-again-path="startAgainPath"
                      :checkin="{
                            guests,
                            checkin: {  agreements, questions: normalizedResponses,  credit_card }
                            }"
                  />
                  <div v-else class="py-5 text-center grey--text">
                    Complete all the steps first
                  </div>
                </v-stepper-content>
              </template>

            </template>
          </responsive-stepper>
        </template>
    </section>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex';
import ReservationIdVerification from './ReservationIDVerification.vue';
import ReservationCharges from './ReservationCharges';
import ReservationAgreements from './ReservationAgreements';
import ReservationQuestions from './ReservationQuestions';
import ReservationGuest from './ReservationGuests.vue';
import ReservationCheckinCreditCard from './CreditCardCollection.vue';
import ReservationContractSignature from './ReservationContractSignature.vue';
import ResponsiveStepper from "@/components/ResponsiveStepper";
import reservation from "@/domain/Reservation/Mixins/reservation";
import session from "@/domain/Reservation/Mixins/session";

export default {
    name: "ReservationCheckin",
    mixins: [reservation, session],
    components: {
      ResponsiveStepper,
       ReservationIdVerification,
       ReservationCharges, ReservationAgreements,
       ReservationQuestions, ReservationContractSignature,
       ReservationGuest, ReservationCheckinCreditCard
    },
    props: {
        reservation: Object,
        startAgainPath: String
    },
    data(){
        return {
            checkingin: false,
            currentStep: 1,
            verification: null,
            charges: null ,
            agreements: null,
            instruction: false,
            questions: null,
            credit_card: null,
            guests: null,
            vertical: false,
        }
    },

    computed: {
        ...mapGetters(['current_user', 'checkin']),

        canStart() {
            return !!this.current_user.auth && !!this.current_user.profile
        },

        setting() {
            return this.reservation ? this.reservation.setting : null
        },

        steps() {
            const steps = [];

            if(!this.reservation) return steps;

            if(this.reservation.require_id_verification) {
                steps.push({
                    id: 'id-verification',
                    completed: this.verificationSubmitted
                })
            }

            steps.push({
                id: 'guest',
                completed: this.guestsAvailable
            })
            
            if(this.reservation.questions && this.reservation.questions.length) {
                steps.push({
                    id: 'questions',
                    completed: this.questionsRespondedTo
                })
            }

            if(this.allReservationAgreements.length) {
                steps.push({
                    id: 'agreements',
                    completed: this.agreementsAgreed
                })
            }

          if(this.reservation.require_credit_card) {
            steps.push({
              id: 'credit-card',
              completed: this.creditCardCollected
            })
          }

          if((this.reservation.charges && this.reservation.charges.length) || this.reservation.balance) {
              steps.push({
                  id: 'payment',
                  completed: this.allPaymentMade
              })
          }

            steps.push({
                id: 'contract'
            })

            return steps;
        },

        allPaymentMade(){
            if(!this.charges) return true;
            return this.charges.filter(charge => !charge.optional)
                .every(charge => charge.payment !== null && charge.payment !== undefined );
        },

        verificationSubmitted(){
            return this.verification !== null;
        },

        agreementsAgreed(){
            if(!this.agreements) return false;
            return this.allReservationAgreements
                .every(agreement => this.agreements.map(a => a.agreement)
                .includes(agreement.agreement.agreement))
        },


        creditCardCollected(){
            if(!this.setting) return false;
            return this.credit_card && !!this.credit_card[this.setting.payment_gateway];
        },

        normalizedResponses() {
            if(!this.questions) return [];

            return this.questions.map(question => {
                const response = typeof(question.response) === 'string'
                ? {
                    option: question.response,
                }
                : question.response;

                return {
                    ...question,
                    response
                }
            });
        },

        questionsRespondedTo(){

            const requiredQuestionsAnswered = () => {
                return this.normalizedResponses.every(question => {
                    if(question.required)  return question.response != null && question.response != ''
                    return true;
                }); 
            }

            // const respondedQuestionAgreementsAgreed = () => {
            //     return this.questions.every(question => {
            //         if(question.response && question.response.agreement)  return question.response.agreement.agreed === true;
            //         return true;
            //     }); 
            // }

            return requiredQuestionsAnswered();
        },

        allReservationAgreements(){
            let agreements = [];
            if(this.property.terms){
                agreements.push({
                    agreement: {
                        agreement: "Property terms and condition",
                        link: this.property.terms
                    }
                })
            }

            if(this.reservation.agreements && this.reservation.agreements.length){
                agreements = agreements.concat(this.reservation.agreements.map(agreement => {
                    return {
                        agreement
                    };
                }))
            }

            if(this.questions && this.questions.length) {

                this.questions
                .filter(question => 
                question.response 
                && (question.response instanceof Object) 
                && question.response.attachments 
                && question.response.attachments.agreements 
                && question.response.attachments.agreements.length
                ).forEach(question => {
                    question.response.attachments.agreements.forEach(agreement => {
                        const exitingIndex = agreements.findIndex(a => a.agreement.id === agreement.id); {
                            const newAgreement = {
                                    agreement,
                                    question: question
                            }
                            if(exitingIndex >= 0) {
                                // Replace the agreement with the one with question
                                agreements.splice(exitingIndex, 1, newAgreement)
                            } else {
                                agreements.push(newAgreement);
                            }
                        }
                    })
                })
            }

            return agreements;
        },

        attachedCharges() {
            let charges = [];

            if(this.questions && this.questions.length) {
                this.questions
                .filter(question => 
                question.response 
                && (question.response instanceof Object) 
                && question.response.attachments 
                && question.response.attachments.charges 
                && question.response.attachments.charges.length
                ).forEach(question => {
                    charges = charges.concat(question.response.attachments.charges)
                })
            }

            return charges;
        },

        guestsAvailable() {
            return this.guests && this.guests.length > 0;
        },

        approved(){
            return this.reservation.approved
        },

        capturePreAuthorize() {
          return this.noOfNight >= this.setting.max_period_for_charge_authorization
        }
    },

    methods: {
        ...mapActions([
            'mutate',
        ]),
        ...mapMutations([
          'SET_AUTH_REQUIRED'
        ]),

        guestAuthenticated(authenticated) {
          if(authenticated && this.checkin_session.session) {
            (this.checkin_session.session?.user_id ? Promise.resolve() : this.updateSessionAttributes({
              user_id: this.current_user.auth?.uid
            })).then(() => {
              this.createSessionActivity({
                title: `Authentication Successful`,
                description: `Authenticated via ${this.current_user.profile?.auth?.sign_in_provider} as ${this.current_user.profile.full_name}`
              })
            }).finally(() => {
              this.canStart = authenticated;
            })
          }
        },

        questionResponded(responses){
            this.questions = responses;
            this.$emit('question-responses', this.normalizedResponses)
        },

        aggrementsResolved(agreements){
            this.agreements = agreements;
            this.$emit('agreement', agreements);
        },

        verificationsFetched(verifications){
            if(verifications){
                const reservationIdVerifications = verifications.filter(v => v.metadata.reservation_id == this.reservation.id);
                if(reservationIdVerifications.length){
                    this.verification = reservationIdVerifications.pop();
                    this.$emit('verification', this.verification);
                }
            }
        },

        chargesPayment(charges){
            this.charges = charges;
            this.$emit('charges-payment', charges);
        },

        creditCardReceived(card){
            this.credit_card = card;
            this.$emit('credit-card', card)
        },

        guestsReceived(guests) {
            this.guests = guests;
        },

        verificationReceived(verification) {
            this.verification = verification;
        },

        stepChanged(step) {
            this.currentStep = step;
        }

    },

    watch: {
        reservation: {
            immediate: true,
            handler(reservation){
              this.SET_AUTH_REQUIRED(!this.canStart)
            }
        },
        questions: {
            handler() {
                this.agreements = [];
            }
        },
        currentStep: {
            immediate: false,
            handler(index) {
              const step = this.steps[index - 1]
              this.createSessionActivity({
                title: "Checkin Progress",
                description: `Checkin step now at ${step.id}`
              })
            }
        }
    }

}
</script>