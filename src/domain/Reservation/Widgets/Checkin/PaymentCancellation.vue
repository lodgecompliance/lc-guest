<template>
<div>
    <confirmation-dialog 
    ref="confirmation"
    @confirmed="stripeRefund"
    max-width="500"
    >
        <h4>Are you sure you want to cancel all payments ?</h4>
        <v-list v-if="payments.length">
            <v-subheader>The following paid charges would be refunded</v-subheader>
            <v-list-item v-for="(payment, i) in payments" :key="i">
                <v-list-item-content>
                    <v-list-item-title> {{ payment.charge.title  }} </v-list-item-title>
                    <v-list-item-subtitle>{{ payment.charge.description }}</v-list-item-subtitle>
                </v-list-item-content>
                <h4 class="mt-2">{{ payment.currency.toUpperCase() }}{{ payment.amount_paid/100  }}</h4>
            </v-list-item>
        </v-list>
    </confirmation-dialog>
    <template v-if="payments.length">
        <v-alert
        border="left"
        colored-border
        type="info"
        >
            Total amount of {{ payments[0].currency.toUpperCase() }}{{ totalAmountPaid/100 }} has been paid
            <div class="mt-3">
                <v-btn small color="error" :loading="loading" @click="$refs.confirmation.open()">
                    <slot>Cancel Payments</slot>
                </v-btn>
            </div>
        </v-alert>
        
    </template>
</div> 
    
</template>
<script>
import { mapActions } from 'vuex';
import ConfirmationDialog from '../../../../components/Utilities/ConfirmationDialog.vue';
import REFUND_RESERVATION_CHARGE from '../../Mutations/refundReservationCharge';

export default {
    name: "CancelCheckin",
    components: { ConfirmationDialog },
    props: {
        property: Object,
        checkin: Object
    },
    data(){
        return {
            refunds: [],
            loading: false,
        }
    },
    computed: {
        charges() {
            if(this.checkin && this.checkin.charges ) return this.checkin.charges;
            return []
        },

        payments() {
            return this.charges.filter(charge => charge.payment !== undefined && charge.payment !== null)
                    .map(charge => charge.payment);
        },

        totalAmountPaid() {
            return this.payments.map(payment => payment.amount_paid).reduce((a,b) => a+b, 0);
        },

        paidCharges() {
            return this.charges.filter(charge => charge.payment !== undefined && charge.payment !== null)
        }
    },
    methods: {
        ...mapActions([
            'mutate'
        ]),

        stripeRefund(){
            this.loading = true;
            Promise.all(
                this.paidCharges.map(charge => {
                    return this.mutate({
                        mutation: REFUND_RESERVATION_CHARGE,
                        variables: {
                            property_id: this.property.id,
                            charge_id: charge.payment.id,
                            amount: charge.amount_captured,
                            reason: 'requested_by_customer',
                            customer_note: 'Payment cancellation'
                        }
                    })
                })
            ).then(response => {
                this.refunds = response;
                this.$store.commit("SNACKBAR", {
                    status: true,
                    text: "Payments cancelled",
                    color: "success"
                })
                this.$emit('cancel');
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.cancel(),
                    message: 'Payment not cancelled. ',
                    exception: e
                 })
            })
            .finally(() => {
                this.loading = false;
            })
        }
    }
}
</script>