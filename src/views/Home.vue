<template>
  <app-layer>
    <template #header>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <div class="d-flex flex-wrap justify-end align-content-center">
            <v-checkbox
                v-for="archive in archives" :key="archive.value"
                v-model="includes"
                :value="archive.value"
                multiple dense
                :label="archive.label"
                class="my-0 mx-2"
            />
          </div>
        </v-col>
      </v-row>
    </template>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <user-reservations :user="current_user.profile" :includes="includes">
          <template #no-reservations>
            <div class="py-8">
              <p class="grey--text text-center">No reservation</p>
            </div>
          </template>
        </user-reservations>
      </v-col>
    </v-row>
  </app-layer>
</template>

<script>
import AppLayer from '@/AppLayer';
import UserReservations from '@/domain/Reservation/Widgets/UserReservations.vue';
import {mapGetters, mapMutations} from "vuex";

export default {
  name: 'RecentCheckins',
  components: {
    AppLayer, UserReservations,
  },
  data(){
    return {
      vertical: false,
      currentTab: 0,
      includes: [],
    }
  },

  methods: {
    ...mapMutations([
        'SET_CURRENT_PROPERTY'
    ])
  },

  computed:{
    ...mapGetters(['current_user']),
    archives() {
      return [
        { value: 'checkedout', label: "checked out" },
        { value: 'cancelled', label: "cancelled" }
      ]
    }
  },

  mounted() {
    this.SET_CURRENT_PROPERTY(null);
  },

  watch: {
    $route: {
      immediate: true,
      handler(route) {
        if(route.query.includes) {
          this.includes = Array.isArray(route.query.includes) ? route.query.includes : [route.query.includes]
        }
      }
    },
  }
}
</script>
