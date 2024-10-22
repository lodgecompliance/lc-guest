<template>
  <v-badge
      color="red"
      :content="unreadNotifications"
      offset-y="24" offset-x="24"
  >
    <v-btn
        :href="notificationsLink"
        target="_blank"
        :loading="loading"
        icon>
      <v-icon>mdi-bell</v-icon>
    </v-btn>
  </v-badge>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import config from "@/config";
import gql from "graphql-tag";
import Lc from "@/lc";

export default {
  name: "HeaderNotifications",
  data() {
    return {
      loading: false,
      notifications: [],
    }
  },
  computed: {

    ...mapGetters(['authenticated']),

    notificationsLink() {
      return Lc.link('notifications')
    },

    unreadNotifications() {
      return this.notifications.filter(n => !n.read).length.toString()
    }
  },

  methods: {
    ...mapActions(['query']),
    getNotifications() {
      this.loading = true;
      this.query({
        domain: config.apollo.account,
        query: gql`
        query getAuthUser {
          getAuthUser {
            notifications {
                id
                read
            }
          }
        }`,
      })
      .then(response => {
        this.notifications = response.data.getAuthUser?.notifications || []
      }).finally(() => {
        this.loading = false;
      })
    }
  },

  watch: {
    authenticated: {
      immediate: true,
      handler(auth) {
        if(auth) this.getNotifications()
      }
    }
  }
}
</script>

<style>
.theme--dark.v-badge .v-badge__badge::after {
  border-color: #FFFFFF !important;
}
</style>