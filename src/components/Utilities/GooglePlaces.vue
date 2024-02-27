<template>
    <v-autocomplete
        v-model="location"
        :loading="loading"
        :items="predictions"
        :search-input.sync="search"
        v-bind="$attrs"
        v-on="$listeners"
    ></v-autocomplete>
</template>

<script>
import config from '../../config';

export default {
    name: "GooglePlaces",
    data: () => ({
      location: null,
      search: null,
      searchResults: [],
      service: null,
      loading: false
    }),

    metaInfo () {
      return {
        script: [{
          src: `https://maps.googleapis.com/maps/api/js?key=${config.google.api_key}&libraries=places`,
          async: true,
          defer: true,
          callback: () => this.MapsInit()
        }]
      }
    },

    props: {
        value: String
    },
    computed: {
        predictions(){
            return this.searchResults.map(prediction => prediction.description);
        }
    },

    methods: {
      MapsInit () {
        this.service = new window.google.maps.places.AutocompleteService()
      },

      displaySuggestions (predictions, status) {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
          this.searchResults = []
          return
        }
        this.searchResults = predictions;
        this.loading = false
      }
    },

  mounted() {
      if(this.value) {
        this.location = this.value;
        this.searchResults =  [{description: this.value}]
      }
  },

  watch: {
      search (val) {
        if (val && this.service) {
            this.loading = true
            this.service.getPlacePredictions({
                input: val,
                // types: ['(regions)']
            }, this.displaySuggestions)
        }
      }
    }
}
</script>