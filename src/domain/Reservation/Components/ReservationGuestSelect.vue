<template>
    <div>
        <v-autocomplete
            v-if="type === 'list'"
            :loading="loading"
            :items="items"
            v-on="$listeners"
            v-bind="$attrs"
            return-object
            :no-data-text="`${loading ? 'Please wait...': `No guest.`}`"
        >
        </v-autocomplete>
        
        <data-container v-else-if="type === 'cards'" :loading="loading">
              <h4 v-if="$attrs.label" class="text-center headline">{{ $attrs.label }}</h4>
                <div class="d-flex flex-wrap justify-center my-3">
                    <v-card v-for="guest in items" :key="guest.id"
                    outlined
                    :disabled="guest.user_id != null"
                    :class="`ma-1 ${selected && selected.id === guest.id ? 'primary' : '' }`" width="200">
                        <v-card-text class="text-center">
                          <template v-if="selected && selected.id === guest.id">
                            <v-avatar color="white" size="40">
                              <span class="primary--text headline">{{ guest.name.substring(0,1) }}</span>
                            </v-avatar>
                            <h3 class="white--text text-truncate my-3">{{ guest.name }}</h3>
                          </template>
                          <template v-else>
                            <v-avatar color="primary" size="40">
                              <span class="white--text headline">{{ guest.name.substring(0,1) }}</span>
                            </v-avatar>
                            <h3 class="text-truncate my-3">{{ guest.name }}</h3>
                          </template>

                            <v-btn v-if="guest.user_id"
                            color="success"
                            text x-small>
                                <span class="text-truncate">
                                  <v-icon x-small class="mr-1">mdi-check-circle</v-icon> Already Confirmed
                                </span>
                            </v-btn>
                            <v-btn v-else
                             text
                            color="primary"
                            @click="$emit('input', guest)"
                            >
                                <v-icon  v-if="selected && selected.id === guest.id" class="mr-1">mdi-check</v-icon>Select
                            </v-btn>
                        </v-card-text>  
                    </v-card>
                </div>
        </data-container>
    </div>
    
</template>

<script>
import DataContainer from '../../../components/DataContainer.vue';

export default {
    name: "ReservationGuestSelect",
    components: {
        DataContainer
    },
    props: {
        reservation: Object,
        type: {
            type: String,
            default: () => 'cards'
        }
    },
    data() {
        return {
            loading: false,
            items: []
        }
    },

    computed: {
        selected() {
            return this.$attrs.value
        }
    },

    watch: {
        reservation: {
            immediate: true,
            handler(reservation) {
                if(reservation && reservation.guests && reservation.guests.length) {
                    this.items = reservation.guests
                }
            }
        }
    }
}
</script>