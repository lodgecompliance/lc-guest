<template> 
    <div class="py-2">

        <template v-if="canSign">
            <v-alert
            colored-border
            border="left"
            color="success"
            >
                You can proceed to sign checkin contract
            </v-alert>
            <v-btn
            color="primary"
            @click="$refs.contract.open()" 
            :disabled="!canSign" depressed
            >Sign contract</v-btn>
        </template>
       
        <reservation-checkin-contract
            ref="contract"
            v-on="$listeners"
            :reservation="reservation"
            :checkin="{ ...checkin, verification }"
            :property="property"
            :pdfable="false"
        />
    </div>
</template>


<script>
import ReservationCheckinContract from './ReservationCheckinContract.vue'

export default {
    name: "ReservationContractSignature",
    components: {
      ReservationCheckinContract
    },
    data(){
        return {
            verification: null,
            canSign: true,
        }
    },
    props: {
        checkin: Object,
        reservation: Object,
        property: Object,
        startAgainPath: String,
    },
    computed: {
        setting() {
            return this.reservation ? this.reservation.setting : null;  
        },
    },

    watch: {

    }
}
</script>