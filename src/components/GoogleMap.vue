<template>
  <iframe
      v-if="latitude && longitude"
      :width="width"
      :height="height"
      style="border: none"
      :src="src"
  >
  </iframe>
  <div v-else class="text-center grey--text py-5" style="background-color: #f7f7f7">
    <v-icon size="70">mdi-map-marker</v-icon>
    <div><small>Location not available</small></div>
  </div>
</template>

<script>
    export default {
      name: "GoogleMap",
      props: {
        height: {
          type: Number,
          default: () => 200
        },
        width: {
          type: [Number, String],
          default: () => '100%'
        },
        latitude: String,
        longitude: String
      },
      computed: {
        src() {
          return `https://maps.google.com/maps?q=${this.latitude},${this.longitude}&hl=en&z=15&output=embed`
        }
      }
    }
</script>


