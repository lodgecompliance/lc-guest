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
`
export default {
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['current_user', 'checkin_session']),
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
                        session_id: this.sessionId,
                        reservation_id: this.checkin_session.reservation.id,
                        // user_id: this.current_user.auth?.uid,
                    }
                }).then(response => {
                    this.SET_CHECKIN_SESSION(response.data.getReservationCheckinSession);
                }).finally(() => resolve())
            })
        },

        createSession() {
            return new Promise(async resolve => {
                this.mutate({
                    mutation: gql`
                    mutation createReservationCheckinSession($reservation_id: ID!, $info: [MetaDataInput], $browser: [MetaDataInput], $location: [MetaDataInput]) {
                        createReservationCheckinSession(reservation_id: $reservation_id, info: $info, browser: $browser, location: $location) {
                          ${QLFields}
                        }
                    }`,
                    variables: {
                        reservation_id: this.checkin_session.reservation.id,
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
                        query: { ...this.$route.query, session: this.checkin_session.session.id }
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
                    mutation updateReservationCheckinSessionAttributes($reservation_id: ID!, $session_id: ID!, $data: [MetaDataInput]) {
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
        }
    }
}