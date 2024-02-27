<template> 
    <div>
        <v-list dense v-if="agreements.length">
            <property-agreement v-for="(agreement, i) in agreements" :key="i" 
            :icon="false" :agreement="agreement.agreement" class="px-0">
                <template v-slot:select="{  agreement }">
                    <v-checkbox dense :value="agreement" v-model="agreed"></v-checkbox>
                </template>
            </property-agreement>
        </v-list>
        <div v-else class="grey--text py-5 text-center">
            No agreement for the reservation
        </div>      
    </div>
</template>


<script>
import PropertyAgreement from '../../../Property/Components/PropertyAgreement.vue';

export default {
    name: "ReservationAgreements",
    components: {
        PropertyAgreement
    },
    data(){
        return {
            agreed: [],
        }
    },
    props: {
       agreements: Array
    },
    watch: {
        agreements: {
            immediate: true,
            handler() {
                this.agreed = []
            }
        },
        agreed: {
            immediate: true,
            handler(agreed){
                this.$emit('agreement', agreed)
            }
        }
    }
}
</script>