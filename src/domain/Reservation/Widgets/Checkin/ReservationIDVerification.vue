<template>
  <data-container
      :loading="loading"
      :error="error"
      @retry="getIdentity"
  >
      <v-card v-if="verification" outlined>
        <files-preview
            :value="[verification.id_image]"
            :grid="1" :allow-remove="false"
            :item-height="150"
        />
        <v-card-title>
          {{ [verification.first_name, verification.last_name].join(" ") }}
        </v-card-title>
        <v-card-subtitle class="grey--text">
          {{ verification.id_type }}: {{ verification.id_number }}
        </v-card-subtitle>
        <slot v-bind="{ loading, verification }" />
      </v-card>
      <v-card v-else outlined>
        <v-card-text class="text-center grey--text py-5">
          ID verification not available
        </v-card-text>
        <slot v-bind="{ loading, verification }" />
      </v-card>
  </data-container>
</template>
<script>
import gql from "graphql-tag";
import {mapActions, mapGetters} from "vuex";
import config from "@/config";
import DataContainer from "@/components/DataContainer.vue";
import FilesPreview from "@/components/FilesPreview.vue";

export default {
  name: "ReservationIdVerification",
  components: { FilesPreview, DataContainer },
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
    ...mapGetters(['current_user'])
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
              user_id
              first_name
              last_name
              country
              id_type
              id_number
              id_image
              timestamp {
                  created_at
                  updated_at
              }
              stripe {
                  id
                  status
                  type
                  url
                  client_secret
              }
              smile {
                ResultCode
                ResultText
                Actions {
                    Liveness_Check
                    Register_Selfie
                    Selfie_Provided
                    Verify_ID_Number
                    Human_Review_Compare
                    Return_Personal_Info
                    Selfie_To_ID_Card_Compare
                    Human_Review_Update_Selfie
                    Human_Review_Liveness_Check
                    Selfie_To_ID_Authority_Compare
                    Update_Registered_Selfie_On_File
                    Selfie_To_Registered_Selfie_Compare
                }
              }
            }
          }
        }
        `,
        variables: { id: this.current_user.profile.id }
      })
      .then(response => {
        this.verification = response.data.getUserById?.id_verification;
        this.$emit('verification', response.data.getUserById?.id_verification)
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