<template>
    <v-form ref="form" @submit.prevent>
        <v-card :loading="submitting" flat>
          <slot name="header">
            <v-card-title>{{ damage ? damage.title : 'Report Damages' }}</v-card-title>
          </slot>
            <v-card-text>

              <template v-if="['create', 'update'].includes(role)">
                <v-text-field
                    outlined
                    label="Title"
                    placeholder="Enter damage title"
                    :rules="[rules.required]"
                    type="text"
                    v-model="form.title"
                    class="required"
                    dense
                ></v-text-field>
                <v-textarea
                    outlined
                    label="Description"
                    placeholder="Enter damage description"
                    class="required"
                    v-model="form.description"
                    dense
                    :rules="[rules.required]"
                    :hide-details="true"
                ></v-textarea>
                <file-upload
                  v-model="form.files"
                  class="mb-4"
                  multiple
                  path="upload/reservation_damages"
              >
                <template #default="{ document, selectNewFile, uploadFiles }">
                  <files-preview v-model="form.files" class="ma-2" display-type="list"></files-preview>
                  <file-selector
                      :loading="document.uploading"
                      accept="image/*,video/*,application/pdf"
                      multiple
                      @files="uploadFiles">
                        <template v-if="form.files && form.files.length" #default="{ selectNewFile }">
                          <v-btn
                              color="primary"
                              :loading="document.uploading"
                              small outlined
                              @click="selectNewFile"
                          ><v-icon small>mdi-file-plus</v-icon> Add files</v-btn>
                        </template>
                  </file-selector>
                </template>
              </file-upload>
              </template>

              <template v-if="isHost || role === 'attach-charge'">
                <v-text-field
                    outlined
                    label="Charge"
                    placeholder="Enter Amount"
                    :rules="[]"
                    type="number"
                    v-model="form.amount"
                    :disabled="!!(damage && damage.payment)"
                    dense
                >
                  <template #append>
                    <span class="mt-1">{{ reservation.currency }}</span>
                  </template>
                </v-text-field>
                <v-alert
                    v-if="!reservation.setting.payment_gateway"
                    colored-border
                    border="left"
                    type="warning"
                >
                  The reservation does not have a payment gateway set, guest will not be able to make payment
                </v-alert>
              </template>
              <error-handler :error="formError" :can-retry="false" />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="$emit('cancel')">Cancel</v-btn>
                <v-btn
                    color="primary"
                    @click.prevent="submit"
                    :loading="submitting"
                    depressed
                >
                  {{ damage ? 'Save Changes' : 'Send Report' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>
import { mapActions } from 'vuex';
import form from '@/mixins/form';
import FileUpload from "@/components/FileUpload";
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler";
import FileSelector from "@/components/FileSelector";
import FilesPreview from "@/components/FilesPreview";
const QLFields = `
id
title
description
amount
files
created_by {
  id
  full_name
}
resolution {
  resolved_by {
    id
    full_name
  }
  resolved_at
}
dispute {
  title
  description
  files
  disputed_at
}
timestamp {
  created_at
  updated_at
}
`
export default {
  name: "ReservationDamageForm",
  components: {FilesPreview, FileSelector, ErrorHandler, FileUpload},
  mixins: [form],
  data(){
      return {}
  },
  props: {
      reservation: Object,
      damage: Object,
      isHost: Boolean,
      role: { type: String, default: () => 'create' }
  },
  methods: {

    ...mapActions([
        'query',
        'mutate'
    ]),

    setForm() {
      const damage = this.damage || {};
      this.form = {
        title: damage.title || null,
        description: damage.description || null,
        files: damage.files || [],
        amount: damage.amount || null
      }
    },

    resetForm() {
      this.$refs.form.reset();
      this.setForm();
    },

    submission() {
      if(!this.$refs.form.validate()) return Promise.reject(new Error("Fill all necessary fields"));
      this.form.amount = parseFloat(this.form.amount);
      return this.damage ? this.updateDamage() : this.createDamage();
    },

    createDamage() {
      return new Promise((resolve, reject) => {
        this.mutate({
          mutation: gql `mutation createReservationDamage($reservation_id: ID!, $data: ReservationDamageInput!) {
            createReservationDamage(reservation_id: $reservation_id, data: $data) {
              ${QLFields}
            }
          }`,
          variables: {
            reservation_id: this.reservation.id,
            data: this.form
          }
        }).then(response => {
          this.resetForm();
          const damage = response.data.createReservationDamage;
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${damage.title} reported`,
            color: "success"
          })
          this.$emit('damage-reported', damage);
          resolve(damage)
        }).catch(e => reject(e))
      })
    },

    updateDamage() {
        return new Promise((resolve, reject) => {
          this.mutate({
            mutation: gql `mutation updateReservationDamage($reservation_id: ID!, $damage_id: ID!, $data: ReservationDamageInput!) {
              updateReservationDamage(reservation_id: $reservation_id, damage_id: $damage_id, data: $data) {
                ${QLFields}
              }
            }`,
            variables: {
              damage_id: this.damage.id,
              reservation_id: this.reservation.id,
              data: this.form
            }
          }).then(response => {
            const damage = response.data.updateReservationDamage;
            this.$store.commit("SNACKBAR", {
              status: true,
              text: `${damage.title} report updated`,
              color: "success"
            })
            this.$emit('damage-updated', damage);
            resolve(damage)
          })
          .catch(e => reject(e))
        })
      }

  },

  watch: {
    damage: {
      immediate: true,
      handler() {
        this.setForm()
      }
    }
  }
}
</script>