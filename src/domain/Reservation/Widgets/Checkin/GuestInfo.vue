<template>
    
    <data-container :loading="loading">
        <h3 class="mb-3">{{ name }}</h3>
        <div v-if="!edit">
            <reservation-guest-info :info="info" />
            <template v-if="fields.length">
                <v-btn text @click="edit = true" small color="primary"><v-icon>mdi-pencil</v-icon> update</v-btn>
                <slot name="submit-guest" v-bind="{ submit: () => $emit('submit') }">
                    <v-btn small text color="primary" @click="$emit('submit')" depressed>Use info</v-btn>
                </slot>
            </template>
            <template v-else>
                <v-alert
                    colored-border
                    border="left"
                    color="info"
                    >
                    No other information is required
                </v-alert>
                <slot name="submit-guest" v-bind="{ submit: submitInfo }">
                    <v-btn small text color="primary" @click="submitInfo" depressed>Submit</v-btn>
                </slot>
            </template>
        </div>
        <div v-else-if="fields.length">
            <v-form ref="guestInfoForm" @submit.prevent>
                <guest-info-field
                    v-for="field in fields" :key="field"
                    :field="field"
                    :label="field.toUpperCase()"
                    v-model="info[field]"
                    dense
                />
                <slot name="submit-guest" v-bind="{ submit: submitInfo }">
                    <v-btn small color="primary" @click="submitInfo" depressed>Submit</v-btn>
                </slot>
            </v-form>
        </div>
    </data-container>
</template>

<script>
import gql from 'graphql-tag';
import { mapGetters } from 'vuex';
import DataContainer from '../../../../components/DataContainer.vue';
import GuestInfoField from '../../../Property/Components/GuestInfoField.vue';
import ReservationGuestInfo from '../../Components/ReservationGuestInfo.vue';

export default {
    name: "GuestInfo",
    components: {
        DataContainer, GuestInfoField, ReservationGuestInfo
    },
    data(){
        return {
            loading: false,
            fields: [],
            info: {},
            edit: false
        }
    },
    props: {
        property: Object,
    },
    computed: {
        ...mapGetters([
            'current_user'
        ]),
        name() {
            return [this.current_user.profile.first_name, this.current_user.profile.last_name].join(' ');
        },
        completed() {
            return !this.fields.some(field => this.info[field] == null)
        }
    },
    methods: {
        getGuestInfoFields() {
            this.loading = true;
            this.$store.dispatch('query', {
                query: gql`
                    query getPropertyById($id: ID!) {
                      getPropertyById(id: $id) {
                        reservation_settings {
                          guest_info
                        }
                      }
                    }`,
                    variables: {
                        id: this.property.id
                    }
            }).then(response => {
                this.fields = response.data.getPropertyById?.reservation_settings?.guest_info ?? []
                if( this.fields && this.fields.length) {
                    this.fields.forEach(field => {
                        this.info[field] = this.current_user.guest_info ?  this.current_user.guest_info[field] : null
                    })
                    if(this.fields.some(field => this.info[field] == null)) this.edit = true;
                }
            })
            .finally(() => {
                this.loading = false;
            })
        },

      submitInfo() {
          if(this.$refs.guestInfoForm) {
            if(this.$refs.guestInfoForm.validate()) {
              this.$emit('submit')
            }
          } else this.$emit('submit')
        }
    },

    mounted() {
        this.getGuestInfoFields()
    },

    watch: {
        info: {
            immediate: true,
            handler(info) {
                this.$emit('input', info);
            }
        }
    }
}
</script>