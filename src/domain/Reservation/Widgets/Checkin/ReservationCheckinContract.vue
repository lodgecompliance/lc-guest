<template>
    <v-dialog 
        v-model="dialog"
        transition="dialog-bottom-transition" 
        scrollable   
        width="700"
      >
        <v-card>
            <v-card-title class="primary white--text">
                <h4>Reservation Contract</h4>
                <v-spacer></v-spacer>
                <conver-to-pdf v-if="pdfable" v-bind="contractPDF" />
            </v-card-title>

            <v-card-text>
                <section class="my-2">
                  <h4 class="headline">Reservation Details</h4>
                  <reservation-details :reservation="reservation" />
                </section>
              
                <section  v-if="agreements && agreements.length" class="my-2" >
                  <h4 class="headline">Agreements</h4>
                  <template v-if="agreements && agreements.length">
                      <v-list>
                          <v-list-item v-for="(agreement, i) in agreements" :key="i">
                              <v-list-item-icon>
                                  <v-icon>mdi-handshake</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                  <v-list-item-title>
                                      {{ agreement.agreement }}
                                  </v-list-item-title>
                                  <div  v-if="agreement.text">{{ agreement.text }}</div>
                                  <div  v-if="agreement.link && agreement.link !== ''">
                                      <a :href="agreement.link" target="_blank">{{agreement.link}}</a>
                                  </div>
                              </v-list-item-content>
                          </v-list-item>
                      </v-list>
                  </template>
                  <template v-else>
                      <p class="grey--text py-3">No agreement</p>
                  </template>
                </section>
                    
                <section v-if="questions && questions.length" class="my-2">
                    <h4 class="headline">Questions</h4>
                    <v-list v-if="questions && questions.length">
                        <v-list-item v-for="(question, q) in questions" :key="q">
                            <v-list-item-icon>
                                <v-icon>mdi-account-question</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ question.question }}
                                </v-list-item-title>
                                <v-list-item-subtitle v-if="question.response">
                                    Ans: {{ question.response.option  }}
                                    <span class="ml-3" v-if="question.response.agreement">
                                        <v-icon>mdi-attachment</v-icon> <strong>{{ question.response.agreement.agreement }}</strong>
                                        <a class="ml-2" v-if="question.response.agreement.link" :href="question.response.agreement.link" target="_blank">Read agreement</a>
                                    </span>
                                </v-list-item-subtitle>
                                <v-list-item-subtitle v-else>
                                    No response
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <div v-else class="my-5 grey--text text-center">
                        No question responded to for this reservation
                    </div>
                </section>

                <section v-if="reservation.require_credit_card" class="my-2">
                    <h4 class="headline">Credit card</h4>
                    <div v-if="!credit_card" class="text-center">No credit card</div>
                    <template v-if="credit_card && credit_card.stripe">
                        <stripe-credit-card
                            v-if="credit_card.stripe.card"
                            outlined
                            :card="credit_card.stripe.card" class="my-1" />
                        <stripe-payment-method
                            v-else-if="credit_card.stripe.payment_method"
                            outlined
                            :method="credit_card.stripe.payment_method" class="my-1" />
                    </template>
                    <paystack-credit-card
                        v-if="credit_card && credit_card.paystack"
                        outlined
                        :card="credit_card.paystack" class="my-1"
                    />
                </section>

                <section class="my-2">
                  <h4 class="headline">Charges</h4>
                  <reservation-charges
                      :reservation="reservation"
                      :property="property"
                      :_payments="checkin.payments"
                  />
                </section>

                <section v-if="reservation.require_id_verification" class="my-2">
                    <h4 class="headline">ID Verification</h4>
                    <user-identity-verification
                        :user-id="reservation.already_checkedin ? reservation.user_id : $store.getters.current_user.profile.id"
                    />
                </section>
                <section class="my-2">
                  <h4 class="headline">Signature</h4>
                  <signature-pad :signature="checkin.checkin.signature" :editable="!reservation.already_checkedin" :activate="true" v-model="signature" />
                </section>

              <error-handler :error="error" :can-retry="false" />

            </v-card-text>
            <v-card-actions >
                    <v-btn text color="red" @click="close">Close</v-btn>
                    <v-btn
                        v-if="!reservation.already_checkedin"
                        :loading="checkingin"
                        @click="finalizeCheckin"
                        color="primary"
                        :disabled="signature == null"
                        depressed
                    >Finalize checkin</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions } from 'vuex';
    import ReservationDetails from '../../Components/ReservationDetails.vue';
    import ReservationCharges from './ReservationCharges.vue';
    import StripeCreditCard from '../../../../components/Utilities/StripeCreditCard.vue';
    import StripePaymentMethod from '../../../../components/Utilities/StripePaymentMethod.vue';
    import UserIdentityVerification from '../../../User/Components/IdentityVerification.vue';
    import SignaturePad from '../../../../components/Utilities/SignaturePad.vue';
    import PaystackCreditCard from '../../../../components/Utilities/PaystackCreditCard.vue';
    import ConverToPdf from '../../../../components/Utilities/convertToPdf.vue';
    import { contract as pdfContent } from '../../Helpers/pdf';
    import CHECKIN_RESERVATION from '../../Mutations/checkinReservation';
    import session from "@/domain/Reservation/Mixins/session";
    import ErrorHandler from "@/components/ErrorHandler.vue";

    export default {
        name: "ReservationCheckinContract",
        mixins: [session],
        components: {
          ErrorHandler,
            ReservationDetails,
            ReservationCharges, StripeCreditCard, UserIdentityVerification,
            SignaturePad, PaystackCreditCard, StripePaymentMethod,
            ConverToPdf
        },
        data(){
            return {
                dialog: false,
                error: null,
                signature: null,
                checkingin: false,
                creditCards: null,
            }
        },
        props: {
            reservation: Object,
            checkin: Object,
            property: Object,
            pdfable: Boolean
        },
        computed: {

            agreements(){
                return this.checkin.checkin.agreements
            },

            questions(){
                return this.checkin.checkin.questions
            },

            charges(){
                return this.reservation.charges
            },

            credit_card() {
                return this.checkin.checkin.credit_card
            },

            verification(){
                return this.checkin.verification
            },

            guests(){
                return this.checkin.guests
            },

            contractPDF() {
                return {
                    fileName: `${this.property.name} - Guest Registration`,
                    actions: ['open', 'print', 'download'],
                    metadata: {
                        title: `Reservation Contract at ${this.property.name}`,
                        author: `Guest registration (${this.property.name})`,
                        subject: `Reservation at ${this.property.name}`,
                        creator: "Guest Registration via pdfmake",
                        producer: "Guest Registration via pdfmake",

                    },
                    content: pdfContent(this.reservation, this.checkin),
                    iconsAttrs: {
                        icon: true,
                        dark: true,
                    }
                }
            }
        },

        methods: {
            ...mapActions([
                'mutate'
            ]),

            open(){
                this.dialog = true;
            },

            close(){
                this.dialog = false;
            },

            finalizeCheckin(){
                this.error = null;
                this.createSessionActivity({
                  title: "Finalizing Checkin",
                  description: `...`
                })
                this.checkingin = true;
                this.mutate({
                    mutation: CHECKIN_RESERVATION,
                    variables: {
                        reservation_id: this.reservation.id,
                        session_id: this.checkin_session.session.id,
                        checkin: {
                            agreements: this.agreements,
                            questions: this.questions,
                            credit_card: this.credit_card,
                            guests: this.guests,
                            signature: this.signature,
                        }
                       
                    }
                })
                .then(response => {
                    if(response.data.checkinReservation){
                        const reservation = response.data.checkinReservation;
                        this.$store.commit('ADD_USER_RESERVATION', { ...reservation });
                        this.$emit('checkedin', reservation)
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: 'Checkin successful',
                            color: 'success'
                        })
                      this.createSessionActivity({
                        title: "Checkin Finalized",
                        description: `Checkin was completed`
                      })
                    }else{
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: 'Checkin could not be finalized. Try again',
                            color: 'error'
                        })
                      this.createSessionActivity({
                        title: "Failed to Finalize Checkin",
                        description: `Checkin could not be completed`
                      })
                    }
                })
                .catch(e => {
                    this.error = e;
                    this.createSessionActivity({
                      title: "Failed to Finalize Checkin",
                      description: `Checkin could not be completed. ${e.message}`
                    })
                })
                .finally(() => {
                    this.checkingin = false;
                })
            },

        }
    }
</script>