<template>
    <section>
        <h4 class="my-2">Checkin</h4>
        <p>Kindly complete your checkin process</p>
        <data-container :loading="loading">
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
                          :user-id="current_user.profile.id"
                          @verification="(v) => verification = v"
                      >
                        <template #default="{ loading, verification }">
                          <v-card-text v-if="verification">
                            Your ID verification will be shared with {{ property.name }}
                          </v-card-text>
                          <v-card-actions>
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
                    <reservation-guest
                        :property="property"
                        :reservation="reservation"
                        @guests="g => guests = g"
                        @continue="currentStep++"
                    />
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
                    <reservation-questions
                        :reservation="reservation"
                        @questions="q => questions = q"
                        @continue="currentStep++"
                    />
                  </v-stepper-content>
                </template>

                <!-- Agreements -->
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
                    <reservation-agreements
                        :reservation="reservation"
                        :additional-agreements="additionalAgreements"
                        @agreements="a => agreements = a"
                        @continue="currentStep++"
                    >
                      <template #note="{ agreement }">
                        <v-alert v-if="agreement.question"
                                 border="left"
                                 colored-border
                                 type="info"
                        >
                          Because you responded <strong>{{ agreement.question.response.option }}</strong>  to <strong>{{ agreement.question.question }}</strong>
                        </v-alert>
                      </template>
                    </reservation-agreements>
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
                    <reservation-checkin-payments
                        :property="property"
                        :reservation="reservation"
                        :credit-card="credit_card"
                        :extra-charges="attachedCharges"
                        :capture-pre-authorize="capturePreAuthorize"
                        @charges="c => charges = c"
                        @credit-card="cc => credit_card = cc"
                        @continue="currentStep++"
                    />
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
                    <reservation-checkin-credit-card
                        :reservation="reservation"
                        :property="property"
                        @credit-card="cc => credit_card = cc"
                        @continue="currentStep++"
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
                    Contract
                  </v-stepper-step>
                  <v-stepper-content
                      :key="`step-content-${step.id}`"
                      :step="(i+1)"
                      class="px-1 mr-1"
                  >
                    <reservation-contract-signature
                        v-if="steps.filter(s => s.id !== 'contract').every(s => s.completed)"
                        v-on="$listeners"
                        :property="property"
                        :reservation="reservation"
                    />
                    <div v-else class="py-5 text-center grey--text">
                      Complete all the steps first
                    </div>
                  </v-stepper-content>
                </template>

              </template>
            </responsive-stepper>
          </template>
        <template v-else>
          <v-alert type="info">
            Kindly complete authentication
          </v-alert>
        </template>
        </data-container>
    </section>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex';
import ReservationIdVerification from './ReservationIDVerification.vue';
import ReservationAgreements from './ReservationAgreements';
import ReservationQuestions from './ReservationQuestions';
import ReservationGuest from './ReservationGuests.vue';
import ReservationCheckinCreditCard from './CreditCardCollection.vue';
import ReservationContractSignature from './ReservationContractSignature.vue';
import ResponsiveStepper from "@/components/ResponsiveStepper";
import reservation from "@/domain/Reservation/Mixins/reservation";
import session from "@/domain/Reservation/Mixins/session";
import ReservationCheckinPayments from "@/domain/Reservation/Widgets/Checkin/ReservationPayments.vue";
import DataContainer from "@/components/DataContainer.vue";

export default {
    name: "ReservationCheckin",
    mixins: [reservation, session],
    components: {
      DataContainer,
      ReservationCheckinPayments,
      ResponsiveStepper,
       ReservationIdVerification,
       ReservationAgreements,
       ReservationQuestions, ReservationContractSignature,
       ReservationGuest, ReservationCheckinCreditCard
    },
    props: {
        reservation: Object,
        startAgainPath: String
    },
    data(){
        return {
            loading: false,
            currentStep: 1,
            verification: null,
            charges: null ,
            agreements: [],
            instruction: false,
            questions: [],
            credit_card: null,
            guests: [],
            vertical: false,
        }
    },

    computed: {
        ...mapGetters(['current_user']),

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

            if((this.reservation.agreements && this.reservation.questions.length) || this.additionalAgreements.length) {
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
            return this.agreements
                .every(agreement => !!agreement.agreed)
        },

        creditCardCollected(){
            if(!this.setting) return false;
            return this.credit_card && !!this.credit_card[this.setting.payment_gateway];
        },

        questionsRespondedTo(){
            const requiredQuestionsAnswered = () => {
                return this.questions.every(question => question.required ? !!question.response : true);
            }

            // const respondedQuestionAgreementsAgreed = () => {
            //     return this.questions.every(question => {
            //         if(question.response && question.response.agreement)  return question.response.agreement.agreed === true;
            //         return true;
            //     }); 
            // }

            return requiredQuestionsAnswered();
        },

        additionalAgreements(){
            let agreements = [];
            if(this.property.terms){
                agreements.push({
                    agreement: {
                        agreement: "Property terms and condition",
                        link: this.property.terms
                    }
                })
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

        stepChanged(step) {
            this.currentStep = step;
        },

        setCheckinSession() {
          this.loading = true;
          this.setSession().then(() => {
            this.loading = false
          }).catch(e => {
            console.log("Error while setting session-->", e)
          })
        }

    },

  mounted() {
    this.setCheckinSession()
  },

  watch: {
        reservation: {
            immediate: true,
            handler(){
              this.SET_AUTH_REQUIRED(!this.canStart)
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