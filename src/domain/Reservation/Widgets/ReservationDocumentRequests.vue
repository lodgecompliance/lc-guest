<template>
    <data-container :loading="loading" :error="error" @retry="getRequests">
      <v-expansion-panels v-if="requests.length" v-model="panel" accordion focusable flat>
        <v-expansion-panel v-for="request in requests" :key="request.id">
          <v-expansion-panel-header>
            <div class="d-flex justify-space-between">
              <div>
                  <div><strong>{{ request.title }}</strong></div>
                  <small class="grey--text mt-2">{{ request.timestamp.created_at | timestamp }}</small>
                </div>
                <div class="mr-2 d-flex align-center">
                  <item-status
                      :status="request.submission ? 'Submitted' : 'Pending'"
                      :color="request.submission ? 'success' : 'warning'"
                  />
                  <slot name="options" v-bind="{ request, requestUpdated, requestDeleted }" />
                </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="pt-3">
            <p>{{ request.description }}</p>
            <template v-if="request.submission">
              <h3>Submission</h3>
              <files-preview
                  :value="request.submission.files || []"
                  :allow-remove="false"
                  :item-height="150"
                  class="ma-2"
                  display-type="grid"
              />
              <metadata-list-item
                  :metadata="{ key: 'Notes', value: request.submission.notes }"
              />
            </template>
            <template v-if="request.review">
              <h3>Review</h3>
              <v-divider></v-divider>
              <metadata-list-item
              :metadata="{ key: 'Status', value: request.review.status }"
              />
              <metadata-list-item
              :metadata="{ key: 'Comment', value: request.review.comment }"
              />
            </template>
            <slot name="actions" v-bind="{ request, requestUpdated }"  />
          </v-expansion-panel-content>
          <v-divider></v-divider>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-else class="text-center grey--text py-5">
        <p>No document request</p>
      </div>
      <slot name="footer-actions" v-bind="{ createRequest }"></slot>
    </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import DataContainer from "@/components/DataContainer";
import ItemStatus from "@/components/ItemStatus.vue";
import MetadataListItem from "@/components/MetadataListItem.vue";
import FilesPreview from "@/components/FilesPreview.vue";

export default {
    name: "ReservationDocumentRequests",
    components: { FilesPreview, MetadataListItem, ItemStatus, DataContainer},
    data() {
        return {
          loading: false,
          panel: null,
          requests: [],
          error: null,
          dialog: false
        }
    },
    props: {
        reservation: Object,
    },
    computed: {},
    methods: {
      ...mapActions([
          'query'
      ]),
      getRequests() {
        this.loading = true;
        this.error = null;
        this.query({
          query: gql `query getReservation($id: ID!) {
            getReservation (id: $id) {
              document_requests {
                id
                title
                description
                submission {
                  files
                  notes
                  submitted_at
                }
                review {
                  status
                  comment
                  reviewed_at
                }
                timestamp {
                  created_at
                  updated_at
                }
              }
            }
          }`,
          variables: {
            id: this.reservation.id
          }
        }).then(response => {
          this.requests = response?.data?.getReservation?.document_requests || []
        })
        .catch(e => {
          this.error = e
        })
        .finally(() => {
          this.loading = false
        })
      },

      createRequest() {
        this.dialog = true;
      },

      requestCreated(request) {
        this.requests.push(request);
        this.dialog = false;
      },
      requestUpdated(request) {
        const updatedItem = this.requests.find(req => req.id === request.id);
        if(updatedItem) {
          Object.assign(updatedItem, request);
          this.requests.splice(this.requests.findIndex(d => d.id === updatedItem.id), 1, updatedItem)
        }
      },
      requestDeleted(id) {
          this.requests.splice(this.requests.findIndex(d => d.id === id), 1)
      },
    },

    watch: {
        reservation: {
            immediate: true,
            handler() {
                this.getRequests()
            }
        }
    }
}
</script>