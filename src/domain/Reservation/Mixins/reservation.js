import moment from 'moment';
import {mapActions} from "vuex";

export default {
    data() {
        return {
            actionsLoading: []
        }
    },
    computed: {
        property() {
            return this.reservation?.property
        },

        checkinPassed() {
            if(!this.checkinMoment) return true;
            return this.checkinMoment.isBefore(moment().format('YYYY-MM-DD'))
        },

        checkoutPassed() {
            if(!this.checkoutMoment) return true;
            return !this.checkoutMoment.isSameOrAfter(moment().format('YYYY-MM-DD'));
        },

        checkinMoment() {
            return this.reservation ? moment(this.reservation.checkin_date) : null;
        },

        checkoutMoment() {
            return this.reservation ? moment(this.reservation.checkout_date) : null;
        },

        checkedinAtMoment() {
            return moment.unix(this.reservation.checkedin_at);
        },

        approvedAtMoment() {
            return moment.unix(this.reservation.approved_at);
        },

        checkedoutAtMoment() {
            return moment.unix(this.reservation.checkedout_at);
        },

        createdAtMoment() {
            return moment.unix(this.reservation.timestamp.created_at);
        },

        updatedAtMoment() {
            return this.reservation.timestamp.updated_at ? moment.unix(this.reservation.timestamp.updated_at) : null
        },

        cancelledAtMoment() {
            return moment.unix(this.reservation.cancelled_at);
        },

        noOfNight() {
            if(this.reservation && this.checkinMoment && this.checkoutMoment) {
                return this.checkoutMoment.diff(this.checkinMoment, 'days');
            }
            return 0;
        },

        noOfGuest() {
            if(this.guests) return this.guests.length;
            if(this.reservation && this.reservation.guests) {
                return this.reservation.guests.length
            }
            return 1;
        },

        bookingChannel() {
            return this.reservation?.booking_channel?.label === 'Other'
                    ? this.reservation.booking_channel.id
                    : this.reservation?.booking_channel?.label
        }
    },
    methods: {
        ...mapActions([
            'query',
            'mutate'
        ]),
    }
}