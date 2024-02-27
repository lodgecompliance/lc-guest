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
                  <span class="mr-1">{{ request.amount | money(reservation.currency) }}</span>
                  <item-status
                      :status="request.payment ? 'Paid' : 'Pending'"
                      :color="request.payment ? 'success' : 'warning'"
                  />
                  <slot name="options" v-bind="{ request, requestUpdated, requestDeleted }" />
                </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="pt-3">
            <p>{{ request.description }}</p>
            <slot name="actions" v-bind="{ request, requestUpdated }"  />
          </v-expansion-panel-content>
          <v-divider></v-divider>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-else class="text-center grey--text py-5">
        <p>No payment request</p>
      </div>
    </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import DataContainer from "@/components/DataContainer";
import ItemStatus from "@/components/ItemStatus.vue";

export default {
    name: "ReservationPaymentRequests",
    components: { ItemStatus, DataContainer },
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
        isHost: Boolean
    },

    computed: {},

    methods: {
      ...mapActions([
          'query'
      ]),

      getRequests() {
        this.loading = true;
        this.error = null
        this.query({
          query: gql `query getReservation($id: ID!) {
            getReservation (id: $id) {
              payment_requests {
                id
                title
                description
                amount
                payment {
                  amount
                  currency
                  gateway
                  reference
                  status
                  payment_data
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
          this.requests = response?.data?.getReservation?.payment_requests || []
        })
        .catch(e => {
          this.error = e
        })
        .finally(() => {
          this.loading = false
        })
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