<template>
  <v-dialog v-if="useFrame" v-model="open" persistent fullscreen>
    <v-card>
      <slot name="header">
        <v-card-title>
          <h4>{{ title }}</h4>
          <v-spacer></v-spacer>
          <v-btn icon @click="open = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
      </slot>
      <iframe :src="redirectUrl"></iframe>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: "Redirect",
  props: {
    title: String,
    redirectUrl: String,
    useFrame: Boolean,
    allowedDomains: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      open: false
    }
  },
  created() {
    const instance = this;
    const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    const eventer = window[eventMethod];
    const messageEvent = "attachEvent" === eventMethod ? "onmessage" : "message";
    eventer(messageEvent, function(e) {
      if(instance.allowedDomains.includes(e.origin)) {
        instance.$emit("callback", e.data)
      }
    }, false);
  },
  watch: {
    open: {
      immediate: true,
      handler(o) {
        if(o) {
          if(o && !this.useFrame) {
            window.location.href = this.redirectUrl;
          }
        }
      }
    }
  }
}
</script>

<style scoped>
  iframe {
    border: none;
    width: 100%;
    height: 90vh;
  }
</style>

