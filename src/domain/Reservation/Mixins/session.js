import {mapActions, mapGetters, mapMutations} from "vuex";
import gql from 'graphql-tag';
import appHelper from "@/helper/app"

const QLFields = `
id
user_id
info {
    key
    value
}
browser {
    key
    value
}
location {
    key
    value
}
activities {
    title
    description
    timestamp
}
user {
    id
    full_name
}
checkin {
  checkedin_at
  guests {
    name
    type
    user_id
    can_verify_id
    info {
        age
        gender
        phone
        email
        address
    }
  }
  agreements {
      id
      agreement
      link
      text
  }
  questions {
      id
      question
      response {
          option
          attachments {
              agreements {
                  id
                  agreement
                  link
              }
              charges {
                  id
                  type
                  title
                  amount
                  description
                  enable
                  optional
                  currency
                  unit
                  multipliers {
                      min
                      max
                      unit
                  }
              }
              questions {
                  id
                  question
                  response_type
                  required
                  options {
                      option
                  }
                  response {
                      option
                  }
              }
          }
      }
  }
  credit_card {
      stripe {
          customer
          card {
              id
              brand
              customer
              exp_month
              exp_year
              last4
              name
          }
          payment_method {
              id
              type
              card {
                  brand
                  exp_month
                  exp_year
                  last4
              }
          }
      }
      paystack {
          card_type
          authorization_code
          exp_month
          exp_year
          last4
          reusable
      }
  }
  signature
}  
`
export default {
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['current_user', 'authenticated', 'checkin_session']),
        sessionId() {
            return this.checkin_session.session?.id || this.$route.query.session
        }
    },
    methods: {
        ...mapActions(['query', 'mutate']),
        ...mapMutations(['SET_CHECKIN_SESSION', 'SET_CHECKIN_SESSION_MEMORY']),

        getSession() {
            return new Promise(resolve => {
                this.query({
                    query: gql`
                       query getReservationCheckinSession($reservation_id: ID!, $session_id: ID, $user_id: ID) {
                        getReservationCheckinSession(reservation_id: $reservation_id, session_id: $session_id, user_id: $user_id) {
                          ${QLFields}
                        }
                    }`,
                    variables: {
                        reservation_id: this.checkin_session.reservation.id,
                        user_id: this.current_user.auth?.uid,
                    }
                }).then(response => {
                    const session = response?.data?.getReservationCheckinSession
                    this.SET_CHECKIN_SESSION(session);
                    for (const key in session?.checkin) {
                        this.setCheckinData(key, session.checkin[key])
                    }
                }).finally(() => resolve())
            })
        },

        createSession() {
            return new Promise(async resolve => {
                this.mutate({
                    mutation: gql`
                    mutation createReservationCheckinSession($reservation_id: ID!, $user_id: ID, $info: [MetadataInput], $browser: [MetadataInput], $location: [MetadataInput]) {
                        createReservationCheckinSession(reservation_id: $reservation_id, user_id: $user_id, info: $info, browser: $browser, location: $location) {
                          ${QLFields}
                        }
                    }`,
                    variables: {
                        reservation_id: this.checkin_session.reservation.id,
                        user_id: this.current_user.auth?.uid,
                        info: [],
                        browser: this.convertObjectToMetaKeyValue({
                            ...appHelper.getBrowserInfo(),
                            "IP": await appHelper.getIpAddress() || 'N/A',
                        }),
                        location: this.convertObjectToMetaKeyValue(await appHelper.getLocation())
                    }
                }).then(response => {
                    this.SET_CHECKIN_SESSION(response.data.createReservationCheckinSession)
                }).finally(() => resolve())
            })
        },

        setSession() {
            return new Promise(resolve => {
                this.getSession().then(() => {
                    return this.checkin_session.session ? Promise.resolve() : this.createSession()
                }).then(() => {
                    return this.$router.replace({
                        ...this.$route,
                        query: { ...this.$route.query, session: this.checkin_session.session.id, start: 1 }
                    })
                })
                .catch(e => resolve())
                .finally(() => resolve())
            })
        },

        createSessionActivity(activity) {
            if(!this.checkin_session.reservation || !this.checkin_session.session) return;
            return new Promise(resolve => {
                this.mutate({
                    mutation: gql`
                    mutation createReservationCheckinSessionActivity($reservation_id: ID!, $session_id: ID!, $data: ReservationCheckinSessionActivityInput!) {
                        createReservationCheckinSessionActivity(reservation_id: $reservation_id, session_id: $session_id, data: $data) {
                          ${QLFields}
                        }
                    }`,
                    variables: {
                        reservation_id: this.checkin_session.reservation.id,
                        session_id: this.checkin_session.session.id,
                        data: activity
                    }
                }).then(response => {
                    this.SET_CHECKIN_SESSION(response.data.createReservationCheckinSessionActivity)
                }).finally(() => resolve())
            })
        },

        updateSessionAttributes(attributes) {
            if(!this.checkin_session.reservation || !this.checkin_session.session) return;
            return new Promise(resolve => {
                this.mutate({
                    mutation: gql`
                    mutation updateReservationCheckinSessionAttributes($reservation_id: ID!, $session_id: ID!, $data: [MetadataInput]) {
                        updateReservationCheckinSessionAttributes(reservation_id: $reservation_id, session_id: $session_id, data: $data) {
                          ${QLFields}
                        }
                    }`,
                    variables: {
                        reservation_id: this.checkin_session.reservation.id,
                        session_id: this.checkin_session.session.id,
                        data: this.convertObjectToMetaKeyValue(attributes)
                    }
                }).then(response => {
                    this.SET_CHECKIN_SESSION(response.data.updateReservationCheckinSessionAttributes)
                }).finally(() => resolve())
            })
        },

        setCheckinData(key, value) {
            this.SET_CHECKIN_SESSION_MEMORY({ key, value })
        },

        getCheckinData(key) {
            return this.checkin_session.memory[key]
        },

        attachSessionToAuthUser() {
            if(this.authenticated && this.checkin_session.session) {
                (this.checkin_session.session?.user_id ? Promise.resolve() : this.updateSessionAttributes({
                    user_id: this.current_user.auth?.uid
                })).then(() => this.createSessionActivity({
                    title: `Authentication Successful`,
                    description: `Authenticated via ${this.current_user?.auth?.sign_in_provider} as ${this.current_user.profile?.full_name || this.current_user?.auth?.name}`
                }))
            }
        },

        submitGuests(guests) {
            return this.mutate({
                mutation: gql `mutation submitReservationGuests($reservation_id: ID!, $session_id: ID!, $guests: [ReservationGuestInput]){
                    submitReservationGuests(reservation_id: $reservation_id, session_id: $session_id, guests: $guests) {
                        ${QLFields}
                    }
                  }`,
                variables: {
                    reservation_id: this.checkin_session.reservation.id,
                    session_id: this.checkin_session.session.id,
                    guests
                }
            }).then(response => {
                this.setCheckinData('guests', guests)
            })
        },

        submitAgreements(agreements) {
            return this.mutate({
                mutation: gql `mutation submitReservationAgreements($reservation_id: ID!, $session_id: ID!, $agreements: [ReservationCheckinAgreementInput]){
                    submitReservationAgreements(reservation_id: $reservation_id, session_id: $session_id, agreements: $agreements) {
                        ${QLFields}
                    }
                  }`,
                variables: {
                    reservation_id: this.checkin_session.reservation.id,
                    session_id: this.checkin_session.session.id,
                    agreements
                }
            }).then(response => {
                this.setCheckinData('agreements', agreements)
            })
        },

        submitQuestions(questions) {
            return this.mutate({
                mutation: gql `mutation submitReservationQuestions($reservation_id: ID!, $session_id: ID!, $questions: [ReservationCheckinQuestionInput]){
                    submitReservationQuestions(reservation_id: $reservation_id, session_id: $session_id, questions: $questions) {
                        ${QLFields}
                    }
                  }`,
                variables: {
                    reservation_id: this.checkin_session.reservation.id,
                    session_id: this.checkin_session.session.id,
                    questions
                }
            }).then(response => {
                this.setCheckinData('questions', questions)
            })
        },

        submitCreditCard(card) {
            return this.mutate({
                mutation: gql `mutation submitReservationCreditCard($reservation_id: ID!, $session_id: ID!, $credit_card: ReservationCheckinCreditCardInput){
                    submitReservationCreditCard(reservation_id: $reservation_id, session_id: $session_id, credit_card: $credit_card) {
                        ${QLFields}
                    }
                  }`,
                variables: {
                    reservation_id: this.checkin_session.reservation.id,
                    session_id: this.checkin_session.session.id,
                    credit_card: card
                }
            }).then(response => {
                this.setCheckinData('credit_card', card)
            })
        }
    }
}