<template>
  <v-menu v-if="current_user.profile">
    <template v-slot:activator="{ on }">
      <profile-avatar
          :profile="current_user.profile"
          size="40"
          v-on="on"
          style="cursor: pointer"
      />
    </template>
    <v-list>
      <v-subheader>
        <profile-avatar size="18" :profile="current_user.profile" />
        <span class="ml-3">{{ current_user.profile.full_name }}</span>
      </v-subheader>
      <v-divider></v-divider>
      <v-list-item :to="{ name: 'home' }">
        <v-list-item-icon>
          <v-icon>mdi-history</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Recent Checkins</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :href="accountLink" target="_blank">
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Account</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action >
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-list-item @click="$emit('signout')">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content class="ml-2">
          <v-list-item-title>Signout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import ProfileAvatar from "@/components/ProfileAvatar";
import {mapGetters} from "vuex";
import config from "@/config";
import Lc from "@/lc";

export default {
  name: "AppMenu",
  components: { ProfileAvatar },
  data() {
    return {
      authDomain: config.app.authDomain
    }
  },
  computed: {
    ...mapGetters(['current_user']),
    accountLink() {
      return Lc.link(``)
    }
  }
}
</script>

<style>
.theme--dark.v-badge .v-badge__badge::after {
  border-color: #FFFFFF !important;
}
</style>