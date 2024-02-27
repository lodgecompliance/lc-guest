<template>
    <data-container :loading="loading">

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
                    <reservation-guest-info 
                    v-if="guest.user_id === current_user.profile.id" 
                    :key="`guest-${g}-info`" :info="guest.info">
                    </reservation-guest-info>
                    <v-divider :key="`divider-${g}`"></v-divider>
                </template>
            </v-list>
            <v-btn v-if="!addGuest" color="primary" @click="addGuest = true" small text>
                <v-icon>mdi-plus</v-icon> Add Guest
            </v-btn>

            <template v-if="addGuest">
                <guest-info
                v-if="newGuest.user_id === current_user.profile.id"
                :property="property"
                v-model="newGuest.info"
                @submit="submitNewGuest"
                >
                    <template #submit-guest="{ submit }">
                        <v-btn color="primary" @click="submit" small text>Submit info</v-btn>
                    </template>
                </guest-info>
                <v-form v-else ref="newGuestForm">
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
                    <v-btn color="primary" @click="submitNewGuest" small depressed>Add Guest</v-btn>

                </v-form>
            </template>
        </template>
        <template v-else>
            <guest-info
                :property="property"
                v-model="newGuest.info"
                @submit="$emit('continue', [newGuest])"
                >
                    <template #submit-guest="{ submit }">
                        <v-btn color="primary" @click="submit()" depressed>Continue</v-btn>
                    </template>>
                </guest-info>
        </template>
    </data-container>
</template>

<script>
import { mapGetters } from 'vuex';
import DataContainer from '../../../../components/DataContainer.vue';
import GuestInfo from './GuestInfo.vue';
import ReservationGuestInfo from '../../Components/ReservationGuestInfo.vue';
import session from "@/domain/Reservation/Mixins/session";

export default {
    name: "ReservationCheckinGuests",
    mixins: [session],
    components: {
        DataContainer, GuestInfo, ReservationGuestInfo
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

            if(this.newGuest.user_id === this.current_user.profile.id) {
              this.guests.unshift(this.newGuest);
              this.createSessionActivity({
                title: "Submitted Guest Info",
                description: `Guest information submitted`
              })
            }  else {
              this.guests.push(this.newGuest);
              this.createSessionActivity({
                title: "Guest added",
                description: `${this.newGuest.name} added as a guest`
              })
            }

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
            this.guests.unshift({
                user_id: this.current_user.profile.id,
                name: [this.current_user.profile.first_name, this.current_user.profile.last_name].join(' '),
                info: {}
            })
        }
    },
    mounted() {
       
    },
    watch: {
        staying: {
            immediate: true,
            handler(staying) {
                const index = this.guests.findIndex(g => g.user_id == this.current_user.profile.id);

                if(staying) {

                    this.addGuest = true;
                    this.newGuest = {
                        user_id: this.current_user.profile.id,
                        name: [this.current_user.profile.first_name, this.current_user.profile.last_name].join(' '),
                        info: {}
                    }

                } else {
                    this.addGuest = false;
                    this.resetGuestForm();

                    if(index >= 0) this.guests.splice(index, 1);
                }
            }
        },
        guests: {
            immediate: true,
            handler(guests) {
                this.$emit('guests', guests)
            }
        }
    }
}
</script>