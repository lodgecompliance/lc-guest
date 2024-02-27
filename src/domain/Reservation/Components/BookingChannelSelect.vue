<template>
    <v-autocomplete 
        :loading="loading"
        :items="items"
        item-value="id"
        item-text="label"
        v-on="$listeners"
        v-bind="$attrs"
        :no-data-text="`${loading ? 'Please wait...': `No booking channel`}`"
    >
    </v-autocomplete>
</template>

<script>

import GET_BOOKING_CHANNELS from '../Queries/getBookingChannels';

export default {
    name: "BookingChannelSelect",

    data(){
        return {
            loading: false,
            items: [],
        }
    },

    methods: {
        getChannels(){
            
            this.loading = true;
            this.$store.dispatch('query', {
                query: GET_BOOKING_CHANNELS,
            })
            .then(response => {
                this.items = response.data.getBookingChannels ? response.data.getBookingChannels  : [];
                this.$emit('all-channels', this.items);
            })
            .finally(() => {
                this.loading = false;
            })
        }
    },

    mounted() {
        this.getChannels();
    }

}
</script>