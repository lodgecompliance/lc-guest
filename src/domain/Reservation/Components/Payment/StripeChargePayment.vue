<template>
<div>
    <v-list-item v-bind="$attrs">
        <v-list-item-icon class="mr-2">
            <v-icon color="success">mdi-check-circle</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>{{  payment.amount | money_value(payment.currency) }}</v-list-item-title>
            <v-list-item-subtitle>
                {{ payment.description }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="paymentMutiples">
                {{ paymentMutiples }}
            </v-list-item-subtitle>
            <slot name="item-subtitles" v-bind="{ charge, payment }" />
        </v-list-item-content>

        <v-list-item-action>
            <slot name="list-action"  v-bind="{ payment }" />
        </v-list-item-action>

        <v-dialog 
            v-model="dialog"
            width="500"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    <span>Payment</span>
                </v-card-title>
                <v-card-text>

                    <stripe-credit-card v-if="creditCard" :card="creditCard" class="mb-2" />

                    <template v-if="payment" >
                        <p>{{ payment.description }}</p>
                        <p class="success--text">Authorized</p>
                        <h1>{{ payment.amount | money_value(payment.currency) }}</h1>
                        <v-list dense>
                            <v-list-item>
                                <v-list-item-icon >
                                    <v-icon color="success">mdi-check-circle</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ payment.amount_captured | money_value(payment.currency) }} Captured
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-icon>
                                    <v-icon color="warning">mdi-credit-card-refund</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title >
                                        {{ payment.amount_refunded | money_value(payment.currency) }} Refunded
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-icon>
                                    <v-icon color="info">mdi-credit-card</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title >
                                        {{ (payment.captured ? payment.net_captured : payment.amount_captured) | money_value(payment.currency) }} Received
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                      <slot name="dialog-actions" />
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="payment.receipt_url"
                    color="primary" small
                    :href="payment.receipt_url"
                    target="_blank" depressed
                    > <v-icon class="mr-2" small>mdi-receipt</v-icon> View Receipt</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="red" @click="$emit('dialog-closed')" text>Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-list-item>

    <div class="d-flex my-3">
        <div>
            <v-chip pill :color="status.color" text-color="white" small>
                {{ status.text }}
            </v-chip>
            <v-chip v-if="amountRefunded" pill color="info" text-color="white" class="ml-2" small>
                Refunded {{ amountRefunded | money_value(payment.currency) }}
            </v-chip>
            <!-- <p v-if="paymentMutiples">{{ paymentMutiples }}</p> -->
        </div>
        <v-spacer></v-spacer>
        <slot name="options" v-bind="{ charge, payment }" />
    </div>
</div>
</template>

<script>
import StripeCreditCard from '@/components/Utilities/StripeCreditCard';

export default {
    name: "ReservationChargePayment",
    components: {
        StripeCreditCard
    },
    props: {
        charge: Object,
        payment: Object,
        creditCard: Object,
        dialog: Boolean,
    },
    computed: {

        isPreAuthorized(){
            return this.charge && this.charge.type === 'pre-authorize'
        },

        amountRefunded(){
            if(!this.payment) return null;
            if(!this.payment.amount_refunded) return null;

            return this.payment.amount_refunded;
        },

        paymentMutiples() {
            if(!this.payment) return null;
            if(this.payment.metadata && this.payment.metadata.custom_multipliers && this.payment.metadata.custom_multipliers.length) {
                return this.payment.metadata.custom_multipliers.map(multiple => {
                    return `${multiple.quantity} ${multiple.unit}`;
                }).join(', ');
            }
            return null;
        },

        status(){
            if(this.payment){

                if(this.payment.captured) {
                    return {
                        color: "success",
                        text: this.isPreAuthorized ? `Captured ${this.payment.currency.toUpperCase()}${this.payment.amount_captured/100}` : `Paid ${this.payment.currency.toUpperCase()}${this.payment.amount_captured/100}`,
                    }
                }
                return {
                        color: "success",
                        text: `Authorized ${this.payment.currency.toUpperCase()}${this.payment.amount/100}`,
                    }
            }

            return {
                color: "error",
                text: this.isPreAuthorized ? "Not Authorized" : "Not Paid"
            }
        },

    }
}
</script>