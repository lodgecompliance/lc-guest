<template>
    <data-container :loading="loading">
      <v-card flat>
        <v-card-text>
          <template v-if="reservation.allow_additional_guest">
            <h4 class="text-h6">Are you staying at the reservation?</h4>
            <v-radio-group
                v-model="staying"
                row
            >
              <v-radio
                  label="Yes"
                  :value="true"
              ></v-radio>
              <v-radio
                  label="No"
                  :value="false"
              ></v-radio>
            </v-radio-group>
          </template>

          <v-list v-if="guests.length">
            <template v-for="(guest, g) in guests">
              <v-list-item :key="`item-${g}`">
                <v-list-item-avatar>
                  <v-avatar color="primary" size="40">
                    <span class="white--text headline">{{ guest.name.substring(0,1) }}</span>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ guest.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="reservation.require_id_verification && guest.can_verify_id">
                    <small class="grey--text">
                      <v-icon size="14">mdi-account-check</v-icon> Needs to carry out ID verification when checkin in
                    </small>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="guest.user_id !== current_user.profile.id">
                  <v-btn icon @click="guests.splice(g, 1)" >
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <guest-info
                  class="my-3"
                  v-if="guest.user_id === current_user.profile.id"
                  :key="`item-info-${g}`"
                  :property="property"
                  v-model="guests[g].info"
              >
              </guest-info>
              <v-divider v-if="g < (guests.length - 1)" :key="`divider-${g}`"></v-divider>
            </template>
          </v-list>

          <template v-if="reservation.allow_additional_guest">
            <v-btn color="primary" @click="addGuest = true" small text>
              <v-icon>mdi-plus</v-icon> Add Guest
            </v-btn>
            <v-form v-if="addGuest" ref="newGuestForm">
              <v-text-field
                  outlined dense
                  label="Guest name"
                  type="text"
                  :rules="[(v) => (v !== null && v !== '') || 'Provide guest name']"
                  v-model="newGuest.name"
              >
              </v-text-field>
              <!--                  <div class="d-flex justify-end" v-if="reservation.require_id_verification">-->
              <!--                    <v-switch-->
              <!--                        v-model="newGuest.can_verify_id"-->
              <!--                        inset dense-->
              <!--                        label="Can verify ID"-->
              <!--                        class="mt-n5"-->
              <!--                    />-->
              <!--                  </div>-->
              <v-btn color="red" text class="mr-2" @click="addGuest = false" small>Cancel</v-btn>
              <v-btn color="primary" @click="submitNewGuest" small outlined depressed>Add Guest</v-btn>
            </v-form>
          </template>

        </v-card-text>
        <slot v-bind="{ guests, submitting, submit }">
          <v-card-actions>
            <v-btn color="primary" :loading="submitting" @click="submit" depressed>Continue</v-btn>
          </v-card-actions>
        </slot>
      </v-card>
    </data-container>
</template>

<script>
import { mapGetters } from 'vuex';
import DataContainer from '../../../../components/DataContainer.vue';
import GuestInfo from './GuestInfo.vue';
import session from "@/domain/Reservation/Mixins/session";

export default {
    name: "ReservationCheckinGuests",
    mixins: [session],
    components: {
        DataContainer, GuestInfo
    },
    data() {
        return {
            loading: false,
            staying: true,
            guests: [],
            addGuest: false,
            newGuest: {
                name: null,
                info: {},
                can_verify_id: true,
            },
            submitting: false,
        }
    },

    computed: {
        ...mapGetters([
            'current_user'
        ]),

    },

    props: {
        reservation: Object,
        property: Object,

    },
    methods: {
        submitNewGuest() {
            if(this.$refs.newGuestForm && !this.$refs.newGuestForm.validate()) return;
            this.guests.push(this.newGuest);
            this.createSessionActivity({
              title: "Guest added",
              description: `${this.newGuest.name} added as a guest`
            })
            this.resetGuestForm();
            this.addGuest = false;
        },

        resetGuestForm() {
            this.newGuest = {
                name: null,
                info: {}
            }
        },

        addCurrentUserAsGuest() {
            console.log("profile log", this.current_user.profile);
            this.guests.unshift({
                user_id: this.current_user.profile.id,
                name: this.current_user.profile.full_name,
                info: this.current_user.profile.guest_info
            })
        },

        submit() {
          this.submitting = true;
          this.submitGuests(this.guests).then(() => {
            this.$emit('continue', this.guests);
          }).catch(e => {
            console.log(e)
          }).finally(() => {
            this.submitting = false;
          })
        }
    },

    watch: {
        reservation: {
          immediate: true,
          handler() {
            this.guests = this.getCheckinData('guests') || [];
            if(
                this.reservation.allow_additional_guest
                && !this.guests.find(g => g.user_id === this.current_user.profile.id)
            ) {
              this.staying = false;
            }
          }
        },
        staying: {
            immediate: true,
            handler(staying) {
                const index = this.guests.findIndex(g => g.user_id === this.current_user.profile.id);
                if(staying) {
                  if(index < 0) this.addCurrentUserAsGuest()
                } else {
                    if(index >= 0) this.guests.splice(index, 1);
                }
            }
        },
      guests: {
        immediate: true,
        deep: true,
        handler(g) {
          this.$emit('guests', g)
        }
      }
    }
}
</script>