<template>
  <v-carousel
      v-if="cards.length"
      v-model="current"
      hide-delimiter-background
      delimiter-icon="mdi-minus"
      :hide-delimiters="cards.length <= 1"
      :show-arrows="cards.length > 1"
      height="auto"
  >
    <v-carousel-item
        v-for="(card, c) in cards" :key="c"
    >
      <slot name="card" v-bind="{ card }" />
    </v-carousel-item>
  </v-carousel>
  <v-card outlined v-else>
    <v-card-text class="py-5">
      <p class="grey--text text-center">No card available</p>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "CreditCardCarousel",
  data(){
    return {
      current: 0
    }
  },
  props: {
    cards: Array
  }
}
</script>