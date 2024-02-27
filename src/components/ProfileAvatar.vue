<template>
  <v-avatar :size="size" v-bind="$attrs" v-on="$listeners">
    <template v-if="profile && profile.image">
      <slot name="image">
        <v-img :src="profile.image"></v-img>
      </slot>
    </template>
    <template v-else-if="initials">
      <slot name="text">
        <span
              class="primary--text"
              :style="`font-size: ${textSize}px`"
        >{{ initials }}</span>
      </slot>
    </template>
    <template v-else>
      <slot name="icon" v-bind="{ size: textSize }">
        <v-icon color="primary" :size="textSize">mdi-account</v-icon>
      </slot>
    </template>
  </v-avatar>
</template>

<script>
export default {
  name: "ProfileAvatar",
  data() {
    return {}
  },
  props: {
    profile: Object,
    size: {
      default: () => 40
    }
  },
  computed: {
    initials() {
      const names = [];
      if(this.profile?.first_name) {
        names.push(this.profile.first_name)
      }
      if(this.profile?.last_name) {
        names.push(this.profile.last_name)
      }
      if(this.profile?.name) {
        names.push(this.profile.name)
      }
      return names.length ? names.map(name => name.substring(0,1)).join("") : null;
    },
    textSize() {
      return Math.ceil(parseInt(this.size)/2);
    }
  }

}
</script>

<style>
.theme--dark.v-badge .v-badge__badge::after {
  border-color: #FFFFFF !important;
}
</style>