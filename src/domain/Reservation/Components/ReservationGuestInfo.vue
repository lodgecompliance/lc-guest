<template>
    <v-row>
        <v-col 
        cols="auto"
        v-for="field in available_fields" :key="field.field">
            <v-icon v-text="field.icon" color="primary"></v-icon> {{ info[field.field] }}
        </v-col>
        <v-col cols="12">
            <slot v-bind="{ available_fields, unavailable_fields }" />
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: "ReservationGuestInfo",
    data() {
        return {
            fields: [
                {
                    label: 'Address',
                    field: 'address',
                    icon: 'mdi-map-marker'
                },

                {
                    label: 'Gender',
                    field: 'gender',
                    icon: 'mdi-gender-male-female-variant'
                },

                {
                    label: 'Phone',
                    field: 'phone',
                    icon: 'mdi-phone'
                },

                {
                    label: 'Email',
                    field: 'email',
                    icon: 'mdi-email'
                },

                {
                    label: 'Age',
                    field: 'age',
                    icon: 'mdi-counter'
                },
            ]
        }
    },
    props: {
        info: Object,
        
    },
    computed: {
        mapped_field() {
            return this.fields.map(info => {
                return {
                    ...info,
                    is_null: !(this.info && this.info[info.field])
                };
            })
        },

        available_fields() {
            return this.mapped_field.filter(info => !info.is_null)
        },

        unavailable_fields() {
            return this.mapped_field.filter(info => info.is_null)
        },
    }
}
</script>