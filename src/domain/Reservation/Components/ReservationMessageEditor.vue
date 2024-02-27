<template>
    <div>
        <v-textarea
            outlined
            label="Message"
            v-model="template"
            class="required"
            dense
            :rules="$attrs.rules ? $attrs.rules : []"
        ></v-textarea>
        <data-container :loading="loading_fields">
            <v-row
                justify="center"
                align="center"
                class="mt-n5"
            >
            <v-col cols="12"><slot /></v-col>
            <v-chip v-for="field in mailFields" :key="field" @click="addFieldToMail(field)"
            class="ma-1">
                {{ field }}
            </v-chip>
            </v-row>
        </data-container>
        
    </div>
</template>

<script>
import gql from 'graphql-tag';
import DataContainer from '../../../components/DataContainer.vue';

export default {
    name: "ReservationMessageEditor",
    components: {
        DataContainer
    },
    data() {
        return {
            template: null,
            loading_fields: false,
            reservation_fields: []
        }
    },
    props: {
        reservation: Object,
        fields: Array,
        value: String,
    },
    computed: {
        mailFields() {
            return ['guest_name', 'checkin_date', 'checkout_date', 'checkin_url'].concat(this.reservation_fields);
        },
    },
    methods: {
         getFields(){
            
            this.loading_fields = true;
            this.$store.dispatch('query', {
                query: gql`
                query getReservationFields {
                    getReservationFields {
                        id
                        label
                        placeholder
                    }
                }`,
            })
            .then(response => {
                const fields =  response.data.getReservationFields ? response.data.getReservationFields  : []
                this.reservation_fields = fields.filter(field => this.reservation && this.reservation[field.id] !== null && this.reservation[field.id] !== undefined)
                .map(field => field.id)
            })
            .finally(() => {
                this.loading_fields = false;
            })
        },

        addFieldToMail(field) {
            this.template += ` {{${field}}} `;
        }

    },

    watch: {
        value: {
            immediate: true,
            handler(v) {
                this.template = v ? v : '';
                // `Hello {{guest_name}}, Thank you for booking at our property via  {{booking_channel}} , your  check in is between  {{checkin_date}} and {{checkout_date}}.`
            }
        },
        template: {
            immediate: true,
            handler(template) {
                this.$emit('input', template);
            }
        },
        fields: {
            immediate: true,
            handler(fields) {
                if(!fields) this.getFields()
                else this.reservation_fields = fields;
            }
        }
    }
}
</script>