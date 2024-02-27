<template> 
    <div class="py-2">
        <reservation-id-verification
            v-if="showIDVerification"
            :reservation="reservation"
            :property="property"
            :callback-url="startAgainPath"
            :must-be-verified="true"
            :confirm-first="true"
            @verification="(v) => verification = v"
            @completed="verificationCompleted"
            @verified="verificationStatus"
            ref="idVerification"
        />

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
import ReservationIdVerification from './ReservationIDVerification.vue';
import ReservationCheckinContract from './ReservationCheckinContract.vue'

export default {
    name: "ReservationContractSignature",
    components: {
        ReservationIdVerification, ReservationCheckinContract
    },
    data(){
        return {
            verification: null,
            canSign: false,
            showIDVerification: false,
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

        uploadAvailableAsFallback() {
            return this.setting.id_verification_provider !== 'upload' 
            && this.verification 
            && this.verification.upload 
            && this.verification.upload.url;
        },

        IDVerified() {
            if(!this.setting || !this.verification) return false;
            switch (this.setting.id_verification_provider) {
                case 'upload':
                    return this.verification.upload && this.verification.upload.url !== null;

                case 'smile':
                    return this.verification.smile !== null;
                
                case 'stripe':
                    return this.verification.stripe && this.verification.stripe.status == 'verified';

                case 'global':
                    return this.verification.stripe && this.verification.stripe.status == 'verified';

                default:
                    return false;
            }            
        }
    },
    methods: {

        verificationStatus(verified) {
            this.canSign = verified;
            this.showIDVerification = !verified;
        },

        verificationCompleted() {
            
        }
    },
    watch: {
        checkin: {
            immediate: true,
            handler(checkin) {
                this.verification = checkin ? checkin.verification : null;
                if(!this.reservation.require_id_verification) {
                    this.canSign = true;
                    this.showIDVerification = false;
                } else if(!this.IDVerified && !this.canSign) {
                    this.showIDVerification = true;
                } else {
                    this.canSign = true;
                    this.showIDVerification = false;
                }
            }
        },
    }
}
</script>