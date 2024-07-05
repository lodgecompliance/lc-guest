<template>
  <v-card-actions>
    <v-btn
        v-if="prevStep"
        color="primary"
        @click="$emit('back')"
        :icon="$vuetify.breakpoint.mobile"
        depressed>
      <v-icon>mdi-chevron-left</v-icon>
      <span v-if="!$vuetify.breakpoint.mobile">Go Back</span>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn
        v-if="nextStep"
        color="primary"
        @click="submit"
        :disabled="!(currentStep && currentStep.completed)"
        :loading="loading"
        depressed>
      Continue
      <v-icon>mdi-chevron-right</v-icon>
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