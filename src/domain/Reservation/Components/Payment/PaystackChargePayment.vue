<template>
    <v-list-item v-bind="$attrs">
        <v-list-item-icon class="mr-2">
            <v-icon color="success">mdi-check-circle</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>{{  charge.amount | money_value(transaction.currency) }}</v-list-item-title>
            <v-list-item-subtitle>
                {{ charge.description }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="paymentMutiples">
                {{ paymentMutiples }}
            </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
            <slot name="list-action"  v-bind="{ payment }" />
        </v-list-item-action>
    </v-list-item>
</template>

<script>
export default {
    name: "ReservationChargePaystackPayment",
    props: {
        payment: Object,
        dialog: Boolean,
    },

    computed: {

        transaction() {
            return this.payment.transaction;
        },

        charge() {
            return this.payment.charge;
        },

        paymentMutiples() {
            if(!this.charge) return null;
            if(this.charge.metadata && this.charge.metadata.custom_multipliers && this.charge.metadata.custom_multipliers.length) {
                return this.charge.metadata.custom_multipliers.map(multiple => {
                    return `${multiple.quantity} ${multiple.unit}`;
                }).join(', ');
            }
            return null;
        },
    }

}
</script>