<template>
  <v-dialog v-model="dialog" width="350">
    <template #activator="{ on }">
      <slot v-bind="{ on }" />
    </template>
    <v-card>
      <v-card-title>
        Submit Document
      </v-card-title>
      <v-card-text>
        <file-upload
            v-model="form.files"
            class="mb-4"
            multiple
            path="upload/reservation_documents"
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
        <v-textarea
            outlined
            label="Notes (optional)"
            placeholder="Enter notes here"
            v-model="form.notes"
            dense
            :rules="[]"
            :hide-details="true"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="dialog = false" depressed>Cancel</v-btn>
        <v-btn color="primary" @click="submit" :loading="submitting" depressed>Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>

import FileUpload from "@/components/FileUpload.vue";
import FileSelector from "@/components/FileSelector.vue";
import FilesPreview from "@/components/FilesPreview.vue";
import form from "@/mixins/form";
import gql from "graphql-tag";
export default {
  name: "ReservationDocumentRequestSubmission",
  components: { FilesPreview, FileSelector, FileUpload },
  mixins: [form],
  data() {
    return {
      dialog: false,
      form: {
        files: [],
        notes: null
      }
    }
  },

  props: {
    property: Object,
    reservation: Object,
    request: Object,
  },

  methods: {
    setForm() {
      const submission = this.request?.submission || {};
      this.form = {
        files: submission.files || [],
        notes: submission.notes || null,
      }
    },

    submission() {
      return new Promise((resolve, reject) => {
        this.mutate({
          mutation: gql `mutation submitReservationDocumentRequest($reservation_id: ID!, $request_id: ID!, $data: ReservationDocumentRequestSubmissionInput!) {
              submitReservationDocumentRequest(reservation_id: $reservation_id, request_id: $request_id, data: $data) {
                id
                submission {
                  files
                  notes
                  submitted_at
                }
              }
            }`,
          variables: {
            request_id: this.request.id,
            reservation_id: this.reservation.id,
            data: this.form
          }
        }).then(response => {
          const request = response.data.submitReservationDocumentRequest;
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `${this.request.title} submitted`,
            color: "success"
          })
          this.dialog = false;
          this.$emit('document-request-updated', request);
          resolve(request)
        })
            .catch(e => reject(e))
      })
    },
  },

  watch: {
    request: {
      immediate: true,
      handler() {
        this.setForm()
      }
    }
  }
}
</script>