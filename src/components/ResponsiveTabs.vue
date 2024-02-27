<template>
  <v-tabs :vertical="!$store.getters.is_mobile" v-bind="$attrs" v-on="$listeners">
    <slot name="tabs" />
    <slot name="items" />
  </v-tabs>
</template>

<script>

import {mapGetters} from "vuex";

export default {
  name: "ResponsiveTabs",
  data() {
    return {
      vertical: false
    }
  },
  computed: {
    ...mapGetters([
        'is_mobile'
    ])
  },

  watch: {
    // is_mobile: {
    //   immediate: true,
    //   handler(v) {
    //     this.$emit('vertical', !v)
    //   }
    // }
  }
}
</script>