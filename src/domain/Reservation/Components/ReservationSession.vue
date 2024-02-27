<template>
  <v-row>
    <v-col cols="12">
      <google-map
      :latitude="locationObject.Latitude"
      :longitude="locationObject.Longitude"
      />
    </v-col>
    <v-col cols="12" md="6">
      <v-list v-if="infoList.length" dense>
        <metadata-list-item
            v-for="(meta, i) in infoList"
            :metadata="meta"
            :key="`meta-${i}`" />
      </v-list>
      <div v-else class="grey--text py-3">
        No information available
      </div>
    </v-col>
    <v-col cols="12" md="6">
      <h4>Activities</h4>
      <v-timeline
          v-if="activities.length"
          class="ml-n8"
          align-top
          dense
      >
        <v-timeline-item
            v-for="(activity, i) in activities"
            :key="i"
            small fill-dot
            color="grey"
        >
          <v-sheet class="pa-2" outlined rounded>
            <h4>{{activity.title}}</h4>
            <small class="grey--text">
              {{ activity.timestamp | timestamp }}
            </small>
            <div>
              {{ activity.description }}
            </div>
          </v-sheet>
        </v-timeline-item>
      </v-timeline>
      <div v-else class="text-center grey--text py-3">
        No activity available
      </div>
    </v-col>
  </v-row>
</template>

<script>
import MetadataListItem from "@/components/MetadataListItem.vue";
import GoogleMap from "@/components/GoogleMap.vue";

export default {
  name: "ReservationSession",
  components: {GoogleMap, MetadataListItem},
  mixins: [],
  props: {
    session: Object
  },
  computed: {
    activities() {
      return this.session.activities;
    },
    info() {
      return this.session?.info || [];
    },
    browser() {
      return this.session?.browser || []
    },
    location() {
      return this.session?.location || [];
    },
    locationObject() {
      return this.convertMetaKeyValueToObj(this.location);
    },
    infoList() {
      return [].concat(this.info, this.browser, this.location);
    }
  }
}
</script>

