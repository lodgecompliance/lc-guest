<template>
    <v-card outlined :loading="loading">
        <v-card-text>
            <div class="d-flex align-center justify-space-between">
                <div v-if="!user" class="d-flex align-center">
                    <v-avatar color="primary" size="40">
                        <span class="white--text headline">{{ guest.name.substring(0,1) }}</span>
                    </v-avatar>
                    <div>
                      <h3 class="ml-2">{{ guest.name }}</h3>
                      <div v-if="reservation.require_id_verification && guest.can_verify_id">
                        <small class="grey--text">
                          <v-icon size="14">mdi-account-check</v-icon> Needs to carry out ID verification when checkin in
                        </small>
                      </div>
                      <span v-if="isPrimaryGuest"
                        class="success--text"
                        ><v-icon small color="success">mdi-check-circle</v-icon> Primary Guest</span>
                    </div>
                </div>
                <div v-else class="d-flex align-center">
                    <v-avatar color="primary" size="40">
                        <span class="white--text headline">{{ user.first_name || guest.name .substring(0,1) }}</span>
                    </v-avatar>
                    <div class="ml-2">
                        <h3>{{ user.full_name || guest.name }}</h3>
                        <div>
                            <span class="gray--text mr-2">{{ guest.name }}</span>
                            <span v-if="isPrimaryGuest"
                            class="success--text"
                            ><v-icon small color="success">mdi-check-circle</v-icon> Primary Guest</span>
                        </div>
                        
                        <reservation-guest-info :info="guest.info" />

                    </div>
                </div>

                <div class="d-flex align-center">
                    <v-chip
                        v-if="isCheckedIn"
                        color="success"
                        dark
                        small
                    >
                        Confirmed
                    </v-chip>
                    <v-chip
                        v-else
                        color="warning"
                        dark
                        small
                    >
                        Unconfirmed
                    </v-chip>
                    <v-menu v-if="reservationOwner && !isPrimaryGuest && !isCheckedIn"
                    origin="center center"
                    transition="scale-transition">
                        <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on">
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense>
                            <v-list-item @click="edit = true">
                                <v-list-item-icon>
                                    <v-icon>mdi-pen</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>Edit Guest</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item @click="$refs.deleteConfirmation.open()">
                                <v-list-item-icon>
                                    <v-icon color="red">mdi-delete</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>Remove Guest</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                
            </div>

            <reservation-guest-form
             v-if="edit"
             class="mt-5"
             :reservation="reservation"
             :guest="guest"
             @cancel="edit = false"
             v-on="$listeners"
              />
            <template v-if="isCheckedIn" >
              <user-identity-verification :user-id="guest.user_id" />
            </template>

        </v-card-text>
        <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteGuest()">
            <div class="text-center">
                Are you sure you want to remove {{ guest.name }}
            </div>
        </confirmation-dialog>
    </v-card>
</template>

<script>
    import ConfirmationDialog from '../../../components/Utilities/ConfirmationDialog.vue'
    import ReservationGuestForm from './ReservationGuestForm.vue';
    import ReservationGuestInfo from './ReservationGuestInfo.vue';

    import DELETE_RESERVATION_GUEST from '../Mutations/deleteReservationGuest';
    import UserIdentityVerification from "@/domain/User/Components/IdentityVerification.vue";

    export default {
        components: {
          UserIdentityVerification,
            ConfirmationDialog,
            ReservationGuestForm, ReservationGuestInfo,
        },
        data(){
            return {
                loading: false,
                edit: false,
                form: {}
            }
        },
        
        props: {
            reservation: Object,
            guest: Object
        },

        computed: {
            
            isCheckedIn() {
                if(!this.guest) return false;
                return !!this.guest.user_id
            },

            reservationOwner() {
                return this.reservation.user_id === this.$store.getters.current_user.profile.id;
            },

            isPrimaryGuest() {
                if(!this.guest || !this.reservation) return false;
                return this.guest.user_id === this.reservation.user_id
            },

            user() {
                return this.guest.user
            },

        },

        methods:{
            deleteGuest() {
                this.loading = true;
                this.$store.dispatch('mutate', {
                    mutation: DELETE_RESERVATION_GUEST,
                    variables: {
                        reservation_id: this.reservation.id,
                        guest_id: this.guest.id,
                    }
                })
                .then(response => {
                   if(response.data.deleteReservationGuest) {
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: 'Guest removed.',
                            color: 'success'
                        });
                        this.$emit('deleted', this.guest)
                   }
                    
                })
                .catch(e => {
                    this.$store.commit('TOAST_ERROR', {
                        show: true,
                        retry: () => this.deleteGuest(),
                        message: 'Could not remove guest. ',
                        exception: e
                    });
                })
                .finally(() => {
                    this.loading = false;
                })
            }
        },
        watch: {
            guest: {
               immediate: true,
               handler(guest) {
                   this.form = {
                       name: guest.name
                   };
               }
           },
        }
    }
</script>