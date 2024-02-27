<template>
  <v-card class="overflow-hidden">
    <v-app-bar
        absolute
        color="primary"
        dark
        shrink-on-scroll
        :src="property.cover_image"
        scroll-target="#page-content"
    >
      <template v-slot:img="{ props }">
        <v-img
            v-bind="props"
            gradient="to top right, rgba(19,84,122,.5), rgba(128,208,199,.8)"
        ></v-img>
      </template>

      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title dark>
          <profile-avatar :profile="property" :size="40" />
          <span class="ml-2">{{ property.name }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>
    <v-sheet
        id="page-content"
        class="overflow-y-auto"
        max-height="600"
    >
      <v-container style="height: 1000px;">
        <slot />
      </v-container>
    </v-sheet>
  </v-card>
</template>

<script>
import ProfileAvatar from "@/components/ProfileAvatar.vue";

export default {
  name: "PropertyPage",
  components: {ProfileAvatar},
  props: {
    property: Object
  }
}
</script>