<template>
    <data-container :loading="loading">
        <v-row>
            <template v-for="(item, i) in items" >
                  <v-col :key="`field-${i}`" cols="6" md="4" class="pa-1">
                      <v-checkbox
                      v-model="selected"
                      :value="item.id"
                      :disabled="disabledFields.includes(item.id)"
                      >
                          <template #label>
                              <slot name="label" v-bind="{ item }">{{ item.label }}</slot>
                          </template>
                      </v-checkbox>
                  </v-col>
            </template>
        </v-row>
    </data-container>
</template>

<script>

import DataContainer from '../../../components/DataContainer.vue';
import GET_RESERVATION_FIELDS from '../Queries/getReservationFields';

export default {
    name: "ReservationFieldsSelect",
    components: { DataContainer },
    data(){
        return {
            loading: false,
            items: [],
            selected: []
        }
    },

    props: {
        value: Array,
        disabledFields: Array
    },

    methods: {
        getFields(){
            
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_RESERVATION_FIELDS,
            })
            .then(response => {
                this.items = response.data.getReservationFields ? response.data.getReservationFields  : []
            })
            .finally(() => {
                this.loading = false;
            })
        }
    },

    mounted() {
        this.getFields();
    },

    watch: {
        value: {
            immediate: true,
            handler(val) {
                if(val) this.selected = val;
            }
        },
        
        selected: {
            immediate: true,
            handler(fields) {
                this.$emit('input', fields);
            }
        }
    }

}
</script>