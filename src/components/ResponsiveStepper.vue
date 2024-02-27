<template>
  <v-stepper box-shadow="0" :vertical="true" v-bind="$attrs" v-on="$listeners" :value="step">
    <slot />
  </v-stepper>
</template>

<script>

export default {
  name: "ResponsiveStepper",
  data() {
    return {
      vertical: false,
    }
  },
  props: {
    step: Number
  },
  created() {
    this.vertical = screen.width > 768;
    window.addEventListener('resize', (e) => {
      this.vertical = screen.width > 768;
    })
  },
  watch: {
    vertical: {
      immediate: true,
      handler(v) {
        this.$emit('vertical');
      }
    }
  }
}
</script>