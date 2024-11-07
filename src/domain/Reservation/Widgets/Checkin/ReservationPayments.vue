<template>
    <v-card flat>
      <v-card-text>
        <reservation-charges
            :reservation="reservation"
            :guests="guests"
            :property="property"
            :submitted-credit-card="creditCard"
            @charges-payment="chargesPayment"
            @credit-card="creditCardReceived"
            :can-pay="true"
            :attachments="extraCharges"
            :fetch-payments="true"
            :capture-pre-authorize="capturePreAuthorize"
        >
          <template #default="{ charge, payment }">

            <template v-if="charge.type === 'pre-authorize'">
              <v-alert v-if="!payment || (payment && !payment.captured)"
               border="left"
               colored-border
               type="info"
              >
                <span v-if="capturePreAuthorize">This charge is refundable</span>
                <span v-else>
                  This is a pre authorized charge.{{ property.name }} will capture the charge later.
                </span>
              </v-alert>
            </template>
          </template>
        </reservation-charges>
      </v-card-text>
      <slot v-bind="{ credit_card, charges, submit }">
        <v-card-actions>
          <v-btn color="primary" @click="$emit('continue')" depressed>Continue</v-btn>
        </v-card-actions>
      </slot>
    </v-card>
</template>

<script>
import session from "@/domain/Reservation/Mixins/session";
import ReservationCharges from "@/domain/Reservation/Widgets/Checkin/ReservationCharges.vue";

export default {
    name: "ReservationCheckinPayments",
    components: {ReservationCharges},
    mixins: [session],
    data(){
        return {
            submitting: false,
            charges: null,
            credit_card: null,
        }
    },

    props: {
      property: Object,
      reservation: Object,
      creditCard: Object,
      extraCharges: Array,
      guests: Array,
      capturePreAuthorize: Boolean,
    },

    methods: {
      chargesPayment(charges){
        this.charges = charges;
        this.$emit('charges', charges);
      },

      creditCardReceived(card){
        this.credit_card = card;
        this.$emit('credit-card', card)
      },

      submit() {
        this.$emit('continue')
      }
    },
}
</script>