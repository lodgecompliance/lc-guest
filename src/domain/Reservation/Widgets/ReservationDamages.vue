<template>
    <data-container :loading="loading" :error="error" @retry="getDamageReports">
      <v-dialog v-model="damageReportDialog" width="400">
        <reservation-damage-form
        :reservation="reservation"
        @damage-reported="damageReported"
        @cancel="damageReportDialog = false"
        :is-host="isHost"
        />
      </v-dialog>
      <v-expansion-panels v-if="reports.length" v-model="panel" accordion focusable flat>
        <v-expansion-panel v-for="damage in reports" :key="damage.id">
          <v-expansion-panel-header>
            <div class="d-flex justify-space-between">
              <div>
                  <div>
                    <strong>{{ damage.title }}</strong>
                    <v-icon v-if="damage.resolution" color="success" class="ml-1" title="Resolved" small>mdi-check-circle</v-icon>
                    <v-icon v-else-if="damage.dispute" color="warning" class="ml-1" title="Disputed" small>mdi-alert</v-icon>
                  </div>
                  <small class="grey--text mt-2">{{ damage.timestamp.created_at | timestamp }}</small>
                </div>
                <div class="mr-2 d-flex align-center">
                    <div v-if="damage.amount > 0">
                      <span class="mr-1">{{ damage.amount | money(reservation.currency) }}</span>
                      <reservation-damage-status :damage="damage" />
                    </div>
                    <slot name="options" v-bind="{ damage, damageUpdated, damageDeleted }" />
                </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="pt-3">
            <p>{{ damage.description }}</p>
            <files-preview
                v-model="damage.files"
                :allow-remove="false"
                display-type="list"
            />
            <template v-if="damage.dispute">
              <h4>
                <v-icon color="warning" size="30">mdi-alert</v-icon> Dispute: {{ damage.dispute.title }}
              </h4>
              <p>{{ damage.dispute.description }}</p>
            </template>
            <div class="d-flex justify-space-between align-center flex-wrap py-1">
              <div>
                <div v-if="damage.created_by">
                  <small class="grey--text">Submitted by <strong>{{ damage.created_by.full_name }}</strong> at {{damage.timestamp.created_at | timestamp}}</small>
                </div>
                <div  v-if="damage.resolution && damage.resolution.resolved_by">
                  <small class="grey--text">
                    Resolved by <strong>{{ damage.resolution.resolved_by.full_name }}</strong> at {{ damage.resolution.resolved_at | timestamp }}
                  </small>
                </div>
              </div>
              <v-spacer></v-spacer>
              <slot name="damage-actions" v-bind="{ damage, damageUpdated }"  />
            </div>
          </v-expansion-panel-content>
          <v-divider></v-divider>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-else class="text-center grey--text py-5">
        <p>No damages</p>
      </div>
      <slot name="footer-actions" v-bind="{ createDamageReport }"></slot>
    </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import DataContainer from "@/components/DataContainer";
import ReservationDamageForm from "@/domain/Reservation/Components/ReservationDamageForm";
import ReservationDamageStatus from "@/domain/Reservation/Components/ReservationDamageStatus";
import FilesPreview from "@/components/FilesPreview";

export default {
    name: "ReservationDamages",
    components: {FilesPreview, ReservationDamageStatus, ReservationDamageForm, DataContainer},
    data() {
        return {
          loading: false,
          panel: null,
          reports: [],
          error: null,
          damageReportDialog: false
        }
    },

    props: {
        reservation: Object,
        isHost: Boolean
    },

    computed: {},

    methods: {
      ...mapActions([
          'query'
      ]),
      getDamageReports() {
        this.loading = true;
        this.error = null;
        this.query({
          query: gql `query getReservation($id: ID!) {
            getReservation(id: $id) {
              damages {
                id
                title
                description
                files
                amount
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
                payment {
                  amount
                  gateway
                  reference
                  payment_data
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
              }
            }
          }`,
          variables: {
            id: this.reservation.id
          }
        }).then(response => {
          this.reports = response?.data?.getReservation?.damages || []
        })
        .catch(e => {
          this.error = e
        })
        .finally(() => {
          this.loading = false
        })
      },
      createDamageReport() {
        this.damageReportDialog = true;
      },
      damageReported(damage) {
        this.reports.push(damage);
        this.damageReportDialog = false;
      },
      damageUpdated(damage) {
        const updatedItem = this.reports.find(d => d.id === damage.id);
        if(updatedItem) {
          Object.assign(updatedItem, damage)
          this.reports.splice(this.reports.findIndex(d => d.id === updatedItem.id), 1, updatedItem)
        }
      },
      damageDeleted(id) {
          this.reports.splice(this.reports.findIndex(d => d.id === id), 1)
      },
    },

    watch: {
        reservation: {
            immediate: true,
            handler() {
                this.getDamageReports()
            }
        }
    }
}
</script>