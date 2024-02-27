<template>
  <router-link :to="route" class="text-decoration-none">
    {{ url($router.resolve(route).route.fullPath)  }}
    <v-icon small>mdi-open-in-new</v-icon>
  </router-link>
</template>
<script>
export default {
  name: "RouteUrl",
  props: {
    route: Object
  }
}
</script>