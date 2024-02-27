<template>
    <div v-if="method">
        <stripe-credit-card v-if="method.type === 'card' && method.card" v-bind="$attrs" :card="method.card">
            <template #actions>
                <slot name="actions" v-bind="{ method }" />
            </template>
        </stripe-credit-card>
        <v-card v-else v-bind="$attrs">
            <v-card-text>
                <p class="grey--text text-center my-3">invalid payment method</p>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import StripeCreditCard from './StripeCreditCard.vue';
export default {
    name: "StripePaymentMethod",
    components: { StripeCreditCard },
    data(){
        return {}
    },

    props: {
        method: Object
    },

}
</script>