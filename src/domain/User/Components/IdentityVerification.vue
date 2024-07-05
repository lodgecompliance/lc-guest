<template>
    <v-card v-bind="$attrs" :loading="loading">
      <data-container
          :loading="loading"
          :error="error"
          @retry="getIdentity"
      >
        <v-card-text v-if="verification">
          <v-alert v-if="verification[provider] && verification[provider].verified"
                   type="success"
                   border="left"
                   colored-border
          >
            ID is verified
          </v-alert>
          <v-alert v-else-if="verification.manually_completed"
                   type="info"
                   border="left"
                   colored-border
          >
            ID was manually uploaded
          </v-alert>
          <v-alert v-else
                   type="warning"
                   border="left"
                   colored-border
          >
            ID not verified
          </v-alert>
          <v-btn :href="idUrl" target="_blank" color="primary" text depressed>
            View ID
            <v-icon class="ml-3" small>mdi-open-in-new</v-icon>
          </v-btn>
        </v-card-text>
        <v-card-text v-else class="text-center grey--text py-5">
          ID verification not available
        </v-card-text>
      </data-container>
      <slot v-bind="{ loading, verification }" />
    </v-card>
</template>

<script>
import gql from "graphql-tag";
import {mapActions, mapGetters} from "vuex";
import config from "@/config";
import DataContainer from "@/components/DataContainer.vue";

export default {
  name: "UserIdentityVerification",
  components: { DataContainer },
  data(){
    return {
      loading: false,
      error: null,
      verification: null
    }
  },
  props: {
    userId: String
  },
  computed: {
    ...mapGetters(['current_user']),

    idUrl() {
      if(this.userId === this.current_user.auth.uid) {
        return `${config.app.authDomain}/id-verification`
      }
      return `${config.app.authDomain}/shared-profile/${btoa(JSON.stringify(this.sharedProfileToken))}`
    },

    provider() {
      return this.verification?.provider
    },

    sharedProfileToken() {
      return {
        id: this.userId,
        shareWith: this.current_user.auth.uid,
        section: "id-verification"
      }
    }
  },
  methods: {
    ...mapActions(['query']),
    getIdentity() {
      this.loading = true;
      this.error = null;
      this.query({
        domain: config.apollo.account,
        query: gql`
        query getUserById($id: ID!) {
          getUserById(id: $id) {
            id_verification {
              provider
              manually_completed
              stripe {
                  verified
              }
              smile {
                verified
              }
            }
          }
        }
        `,
        variables: { id: this.userId }
      })
      .then(response => {
        this.verification = response.data.getUserById?.id_verification;
        this.$emit('verification', this.verification)
      })
      .catch(e => this.error = e)
      .finally(() => this.loading = false)
    }
  },
  watch: {
    userId: {
      immediate: true,
      handler() {
        this.getIdentity()
      }
    }
  }
}
</script>