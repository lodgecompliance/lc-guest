<template>
    <data-container :loading="loading">
      <template v-if="sessions.length">
        <v-expansion-panels v-if="displayType === 'panel'"  v-model="panel" accordion focusable>
          <v-expansion-panel v-for="session in sessions" :key="session.id">
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <profile-avatar :profile="session.user" color="accent" />
                <div class="ml-2">
                  <h4>{{ session.user ? session.user.full_name : "Anonymous" }}</h4>
                  <div>
                    <small class="grey--text">{{ session.id }}</small>
                    <v-icon v-if="session.completed_at" color="success" small>mdi-check-circle</v-icon>
                  </div>
                  <div><small class="grey--text">{{ session.timestamp.created_at | timestamp }}</small></div>
                </div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-3">
              <reservation-session :session="session" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-card v-else flat>
          <v-card-title>
            Checkin Sessions
            <v-spacer></v-spacer>
            <v-btn icon @click="getSessions">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <virtual-scroll :items="sessions" :item-height="80" :height="500">
            <template #default="{ item: session }">
              <v-list-item @click="current = session">
                <v-list-item-avatar>
                  <profile-avatar :profile="session.user" color="accent" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ session.user ? session.user.full_name : "Anonymous"  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <small class="grey--text">{{ session.id }}</small>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <small class="grey--text">{{ session.timestamp.created_at | timestamp }}</small>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="session.completed_at">
                  <v-icon color="success" small>mdi-check-circle</v-icon>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </virtual-scroll>
        </v-card>
      </template>
      <v-sheet v-else class="text-center grey--text py-5" rounded>
        <p>No checkin sessions</p>
      </v-sheet>
      <v-dialog v-model="dialog" width="800" scrollable>
        <v-card v-if="current">
          <v-img class="pa-3 pb-0">
            <div class="d-flex align-center">
              <profile-avatar :profile="current.user" size="40" color="accent" />
              <div class="ml-2">
                <h4>
                  {{ current.user ? current.user.full_name : "Anonymous" }}
                  <v-icon v-if="current.completed_at" color="success" small>mdi-check-circle</v-icon>
                </h4>
                <div><small class="grey--text">{{ current.id }}</small></div>
                <div><small class="grey--text">Last updated {{ current.timestamp.updated_at | timestamp }}</small></div>
              </div>
              <v-spacer></v-spacer>
              <v-btn icon @click="current = null"><v-icon>mdi-close</v-icon></v-btn>
            </div>
          </v-img>
          <v-card-text>
            <reservation-session :session="current" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </data-container>
</template>

<script>
import {mapActions} from "vuex";
import gql from "graphql-tag";
import DataContainer from "@/components/DataContainer";
import ReservationSession from "@/domain/Reservation/Components/ReservationSession.vue";
import ProfileAvatar from "@/components/ProfileAvatar.vue";
import VirtualScroll from "@/components/VirtualScroll.vue";

export default {
    name: "ReservationSessions",
    components: {VirtualScroll, ProfileAvatar, ReservationSession, DataContainer},
    data() {
        return {
          loading: false,
          panel: null,
          current: null,
          sessions: [],
          error: null,
          dialog: false,
        }
    },

    props: {
        reservation: Object,
        displayType: {
          type: String,
          default: () => 'list'
        }
    },

    computed: {},

    methods: {
      ...mapActions([
          'query'
      ]),
      getSessions() {
        this.loading = true;
        this.query({
          query: gql `query getReservation($id: ID!) {
            getReservation(id: $id) {
              checkin_sessions {
                id
                info {
                  key
                  value
                }
                browser {
                  key
                  value
                }
                location {
                  key
                  value
                }
                activities {
                  title
                  description
                  timestamp
                }
                user {
                  id
                  first_name
                  last_name
                  full_name
                }
                completed_at
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
          this.sessions = this.sortDataDesc(
              (response?.data?.getReservation?.checkin_sessions || [])
                  .map(s => ({ ...s, sort_by: s.timestamp.updated_at })),
              "sort_by"
          )
        })
        .catch(e => {
          this.error = e
        })
        .finally(() => {
          this.loading = false
        })
      }
    },

    watch: {
      reservation: {
          immediate: true,
          handler() {
              this.getSessions()
          }
      },
      current: {
          immediate: true,
          handler(session) {
              this.dialog = !!session
          }
      }
    }
}
</script>