<template>
    <v-snackbar v-if="app_layout === 'full'" top right :value="updateExists" :timeout="-1" color="primary">
      <div class="d-flex align-center">
          <div>
              An update is available
          </div>
          <v-spacer></v-spacer>
          <v-btn text @click="refreshApp">
              Update
          </v-btn>
      </div>
    </v-snackbar>
</template>

<script>
import { mapGetters } from 'vuex';
import update from '../mixins/update';

export default {
    name: "AppServiceWorker",
    mixins: [update],
    data() {
        return {
            params: null
        }
    },
    computed: {
        ...mapGetters([
            'app_layout'
        ])
    },
    mounted() {
        this.checkSystemUpdate();
    }
}
</script>