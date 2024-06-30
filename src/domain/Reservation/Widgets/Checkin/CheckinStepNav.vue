<template>
  <v-card-actions>
    <v-btn
        v-if="prevStep"
        color="primary"
        @click="$emit('back')"
        depressed>
      Back to {{ prevStep.name }}
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn
        v-if="nextStep"
        color="primary"
        @click="submit"
        :disabled="!(currentStep && currentStep.completed)"
        :loading="loading"
        depressed>
      Continue to {{ nextStep.name }}
    </v-btn>
  </v-card-actions>
</template>

<script>
export default {
    name: "CheckinStepNav",
    data(){
        return { }
    },
    props: {
      currentStep: Object,
      nextStep: Object,
      prevStep: Object,
      submit: Function,
      loading: Boolean,
    },

}
</script>