<template>
  <v-expansion-panels focusable flat v-model="panel">
    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down">
        <h4>Instructions</h4>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pt-3">
        <div v-if="reservation.instruction" v-html="reservation.instruction"></div>
        <div v-else class="py-5 grey--text text-center">No instruction</div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

</template>

<script>

export default {
    name: "ReservationInstructionExpansion",
    components: {},
    data(){
        return {
            panel: null
        }
    },
    props: {
        reservation: Object
    }
}
</script>