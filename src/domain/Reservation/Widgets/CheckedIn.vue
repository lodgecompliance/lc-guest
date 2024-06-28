<template>
    <data-container :loading="loading" :error="error" @retry="getReservationCheckin">
      <slot v-if="checkin" v-bind="{ checkin, getReservationCheckin }">
        <template>
          <reservation-checkin-contract ref="contract"
                                        :checkin="checkin"
                                        :property="property"
                                        :reservation="reservation"
                                        :pdfable="true"
          />
          <div class="d-flex align-center mb-3">
            <h3 class="">Checkin Information</h3>
            <v-spacer></v-spacer>
            <v-btn color="primary" small outlined class="mt-3" @click="$refs.contract.open()" text>View Contract</v-btn>
          </div>

          <v-expansion-panels focusable flat v-model="panel">

            <v-expansion-panel  v-if="reservation.guests.length">
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Guests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <reservation-guests :reservation="reservation" :include-primary-guest="true" />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel v-if="reservation.require_id_verification">
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>ID Verification</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <user-identity-verification :user-id="reservation.user_id" />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Credit card</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <template v-if="checkin.credit_card">
                  <template v-if="creditCard.stripe" >
                    <stripe-credit-card v-if="creditCard.stripe.card"
                                        :card="creditCard.stripe.card">
                    </stripe-credit-card>

                    <stripe-payment-method v-if="creditCard.stripe.payment_method"
                                           :method="creditCard.stripe.payment_method">
                    </stripe-payment-method>

                  </template>
                  <paystack-credit-card v-if="creditCard.paystack"
                                        :card="creditCard.paystack">
                  </paystack-credit-card>

                  <reservation-payments
                      class="mt-3"
                      outlined
                      :property="property"
                      :reservation="reservation"
                      :payments="checkin.payments"
                  />
                </template>
                <template v-else>
                  <p class="text-center grey--text mt-5">No credit card</p>
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Charges</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <reservation-charges
                    :reservation="reservation"
                    :property="property"
                    :_payments="checkin.payments"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Questions</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <v-list v-if="questions.length" dense>
                  <v-list-item v-for="(question, q) in checkin.questions" :key="q">
                    <v-list-item-icon>
                      <v-icon>mdi-account-question</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ question.question }}
                      </v-list-item-title>
                      <template v-if="question.response">
                        <v-list-item-subtitle >
                          Ans: {{ question.response.option  }}
                        </v-list-item-subtitle>
                        <template v-if="question.response.attachments">
                          <template v-if="question.response.attachments.questions && question.response.attachments.questions.length">
                            <div class="ml-5">
                              <template v-for="(followUpQuestion, fq) in question.response.attachments.questions">
                                <v-list-item-title :key="`follow-up-${fq}`">
                                  {{ followUpQuestion.question }}
                                </v-list-item-title>
                                <v-list-item-subtitle :key="`follow-up-response-${fq}`">
                                  Ans: {{ followUpQuestion.response.option  }}
                                </v-list-item-subtitle>
                              </template>
                            </div>

                          </template>
                        </template>
                      </template>
                      <v-list-item-subtitle v-else>
                        No response
                      </v-list-item-subtitle>

                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <div v-else class="my-5 grey--text text-center">
                  No question responded to for this reservation
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Agreements</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pt-3">
                <v-list v-if="agreements.length">
                  <property-agreement
                      v-for="(agreement, i) in agreements"
                      :key="i" :agreement="agreement" />
                </v-list>
                <div v-else class="my-5 grey--text text-center">
                  No agreement for the reservation
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Damages</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3">
                <reservation-damages :reservation="reservation" class="mx-n6">
                  <template #damage-actions="{ damage, damageUpdated }">
                    <reservation-damage-dispute
                        v-if="!damage.dispute"
                        :reservation="reservation"
                        :damage="damage"
                        @damage-disputed="dmg => damageUpdated(dmg)"
                    />
                    <reservation-damage-payment
                        v-if="damage.amount > 0 && !damage.payment"
                        :reservation="reservation"
                        :property="property"
                        :damage="damage"
                        :payment-provider="reservation.setting.payment_gateway"
                        @damage-payment="dmg => damageUpdated(dmg)"
                    />
                  </template>
                  <template #footer-actions="{ createDamageReport }">
                    <v-card-actions class="mt-2">
                      <v-spacer></v-spacer>
                      <v-btn
                          color="primary"
                          @click="createDamageReport"
                          small depressed>
                        <v-icon>mdi-plus</v-icon>
                        New Damage Report
                      </v-btn>
                    </v-card-actions>
                  </template>
                </reservation-damages>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Payment Requests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3">
                <reservation-payment-requests
                    :reservation="reservation"
                    class="mx-n6">x
                  <template #actions="{ request, requestUpdated }">
                    <reservation-payment-request-payment
                        v-if="!request.payment"
                        :reservation="reservation"
                        :property="property"
                        :request="request"
                        :payment-provider="reservation.setting.payment_gateway"
                        @payment-request-payment="req => requestUpdated(req)"
                    />
                  </template>
                </reservation-payment-requests>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <h4>Document Requests</h4>
              </v-expansion-panel-header>
              <v-expansion-panel-content v-if="checkin" class="pt-3">
                <reservation-document-requests
                    :reservation="reservation"
                    class="mx-n6">
                  <template #actions="{ request, requestUpdated }">
                    <reservation-document-request-submission
                        :property="property"
                        :reservation="reservation"
                        :request="request"
                        @document-request-updated="req => requestUpdated(req)"
                    >
                      <template #default="{ on }">
                        <v-btn v-on="on" color="primary" small depressed>
                          {{ request.submission ? 'Update Document' : 'Submit Document' }}
                        </v-btn>
                      </template>
                    </reservation-document-request-submission>
                  </template>
                </reservation-document-requests>
              </v-expansion-panel-content>
            </v-expansion-panel>

          </v-expansion-panels>

        </template>
      </slot>
    </data-container>
</template>

<script>
    import DataContainer from '../../../components/DataContainer.vue';
    import ReservationCharges from './Checkin/ReservationCharges';
    import StripeCreditCard from '../../../components/Utilities/StripeCreditCard.vue'
    import StripePaymentMethod from '../../../components/Utilities/StripePaymentMethod.vue'
    import PaystackCreditCard from '../../../components/Utilities/PaystackCreditCard.vue'
    import ReservationPayments from '../Components/Payment/ReservationPayments.vue'
    import ReservationCheckinContract from './Checkin/ReservationCheckinContract.vue';
    import UserIdentityVerification from '../../User/Components/IdentityVerification.vue';
    import ReservationGuests from './ReservationGuests.vue';
    import PropertyAgreement from '../../Property/Components/PropertyAgreement.vue';

    import GET_RESERVATION_CHECKIN from '../Queries/getReservationCheckin';
    import ReservationDamages from "@/domain/Reservation/Widgets/ReservationDamages";
    import ReservationDamagePayment from "@/domain/Reservation/Widgets/ReservationDamagePayment";
    import ReservationDamageDispute from "@/domain/Reservation/Components/ReservationDamageDispute.vue";
    import ReservationPaymentRequests from "@/domain/Reservation/Widgets/ReservationPaymentRequests.vue";
    import ReservationPaymentRequestPayment from "@/domain/Reservation/Widgets/ReservationPaymentRequestPayment.vue";
    import ReservationDocumentRequests from "@/domain/Reservation/Widgets/ReservationDocumentRequests.vue";
    import ReservationDocumentRequestSubmission
      from "@/domain/Reservation/Widgets/ReservationDocumentRequestSubmission.vue";
    export default {
        name: "ReservationCheckinDetails",
        components: {
          ReservationDocumentRequestSubmission,
          ReservationDocumentRequests,
          ReservationPaymentRequestPayment,
          ReservationPaymentRequests,
          ReservationDamageDispute,
          ReservationDamagePayment,
          ReservationDamages,
            DataContainer,
            ReservationCharges,
            StripeCreditCard,
            ReservationPayments,
            ReservationCheckinContract,
            UserIdentityVerification,
            ReservationGuests,
            PropertyAgreement,
            PaystackCreditCard,
            StripePaymentMethod
         },

        data(){
            return {
                loading: true,
                error: null,
                checkin: null,
                vertical: false,
                panel: 0,
            }
        },
        props: {
            reservation: Object,
            property: Object,
            fields: { type: String }
        },

        computed: {
          agreements() {
            return this.checkin?.agreements || []
          },
          creditCard() {
            return this.checkin?.credit_card || {}
          },
          questions() {
            return this.checkin?.questions || []
          }
        },

        methods: {

            getReservationCheckin(){
                this.loading = true;
                this.error = null;
                this.$store.dispatch('query',{
                    query: GET_RESERVATION_CHECKIN,
                    variables: {
                        id: this.reservation.id
                    }
                })
                .then(response => {
                    this.checkin = response.data.getReservation?.checkin;
                    if(!this.checkin.user){
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: "The user account that checked in no longer exist",
                            color: "error"
                        })
                    }
                })
                .catch(e => {
                    this.error = e
                })
                .finally(() => {
                    this.loading = false;
                })
            },

        },
        watch: {
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

