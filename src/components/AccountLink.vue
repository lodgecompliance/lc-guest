<template>
  <a :href="authUrl" target="_blank"><slot /></a>
</template>

<script>
import config from "@/config";
export default {
  name: "AccountLink",
  props: {
    path: String,
  },
  computed: {
    authUrl(){
      return config.app.authDomain+this.path
    }
  }
}
</script>