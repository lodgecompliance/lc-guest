<template>
  <v-expansion-panels focusable flat v-model="panel">
    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down">
        <h4>Instructions</h4>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pt-3">
        <v-list v-if="reservation.instructions.length">
          <property-instruction
              v-for="(instruction, i) in reservation.instructions"
              :key="i" :instruction="instruction" />
        </v-list>
        <div v-else class="my-5 grey--text text-center">
          No instruction for the reservation
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

</template>

<script>

import PropertyInstruction from "@/domain/Property/Components/PropertyInstruction.vue";

export default {
    name: "ReservationInstructionExpansion",
    components: {PropertyInstruction},
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