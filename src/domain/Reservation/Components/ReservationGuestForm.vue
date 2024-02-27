<template>
    <v-card v-bind="$attrs" :loading="loading">
        <v-card-text>
            <v-form ref="guestForm">
                <v-text-field
                    outlined
                    label="Guest name"
                    type="text"
                    :rules="[(v) => (v !== null && v !== '') || 'Provide guest name']"
                    v-model="form.name"
                    dense
                >
                </v-text-field>
<!--                <div class="d-flex justify-end" v-if="reservation.require_id_verification">-->
<!--                  <v-switch-->
<!--                      v-model="form.can_verify_id"-->
<!--                      inset dense-->
<!--                      label="Can verify ID"-->
<!--                      class="mt-n5"-->
<!--                  />-->
<!--                </div>-->
                <v-btn color="red" text class="mr-2" @click="$emit('cancel')" small>Cancel</v-btn>
                <v-btn v-if="guest" color="primary" @click="updateGuest" :loading="loading" small>Update</v-btn>
                <v-btn v-else color="primary" @click="createGuest" :loading="loading" small>Add</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
    import CREATE_RESERVATION_GUEST from '../Mutations/createReservationGuest';
    import UPDATE_RESERVATION_GUEST from '../Mutations/updateReservationGuest';
    import DELETE_RESERVATION_GUEST from '../Mutations/deleteReservationGuest';

    export default {
        components: {
            
        },
        data(){
            return {
                loading: false,
                form: {
                    name: null,
                    can_verify_id: true
                }
            }
        },
        
        props: {
            reservation: Object,
            guest: Object
        },

        computed: {
        },

        methods:{
            createGuest() {
                if(!this.$refs.guestForm.validate()) return;
                
                this.loading = true;
                this.$store.dispatch('mutate', {
                    mutation: CREATE_RESERVATION_GUEST,
                    variables: {
                        reservation_id: this.reservation.id,
                        data: this.form
                    }
                })
                .then(response => {
                    if(response.data.createReservationGuest) {
                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: 'Guest added.',
                            color: 'success'
                        });
                        this.$emit('created', response.data.createReservationGuest);
                        this.$emit('cancel');
                    }
                })
                .catch(e => {
                    this.$store.commit('TOAST_ERROR', {
                        show: true,
                        retry: () => this.createGuest(),
                        message: 'Could not add guest. ',
                        exception: e
                    });
                })
                .finally(() => {
                    this.loading = false;
                })
            },

            updateGuest() {
                if(!this.$refs.guestForm.validate()) return;
                
                this.loading = true;
                this.$store.dispatch('mutate', {
                    mutation: UPDATE_RESERVATION_GUEST,
                    variables: {
                        reservation_id: this.reservation.id,
                        guest_id: this.guest.id,
                        data: this.form
                    }
                })
                .then(response => {
                    if(response.data.updateReservationGuest) {

                        this.$store.commit('SNACKBAR', {
                            status: true,
                            text: 'Guest updated.',
                            color: 'success'
                        });
                        this.$emit('updated', response.data.updateReservationGuest);
                        this.$emit('cancel');
                    }
                })
                .catch(e => {
                    this.$store.commit('TOAST_ERROR', {
                        show: true,
                        retry: () => this.updateGuest(),
                        message: 'Could not update guest. ',
                        exception: e
                    });
                })
                .finally(() => {
                    this.loading = false;
                })
            },

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
                   if(guest) {
                       this.form = {
                        name: guest.name,
                         can_verify_id: guest.can_verify_id
                    };
                   }
               }
           },
        }
    }
</script>