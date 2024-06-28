<template>
  <v-card>
    <v-card-text class="pa-0">
      <p>You need to agree to the following. Checking the boxes means you agree to each item</p>
      <v-list dense v-if="agreements.length">
        <property-agreement
            v-for="(agreement, i) in agreements" :key="i"
            :icon="false" :agreement="agreement.agreement"
            class="px-0">
          <template #select="{ agreement: ag }">
            <v-checkbox dense :value="ag" v-model="agreeds"></v-checkbox>
          </template>
          <template #default="{ agreement }">
            <slot name="note" v-bind="{ agreement }" />
          </template>
        </property-agreement>
      </v-list>
      <div v-else class="grey--text py-5 text-center">
        No agreement for the reservation
      </div>
    </v-card-text>
    <slot v-bind="{ agreeds: agreeds, submitting, submit }">
      <v-card-actions>
        <v-btn color="primary" :loading="submitting" @click="submit" depressed>Continue</v-btn>
      </v-card-actions>
    </slot>
  </v-card>
</template>

<script>
import PropertyAgreement from '../../../Property/Components/PropertyAgreement.vue';
import session from "@/domain/Reservation/Mixins/session";

export default {
  name: "ReservationAgreements",
  mixins: [session],
  components: {
    PropertyAgreement
  },
  data() {
    return {
      submitting: false,
      agreeds: [],
    }
  },
  props: {
    reservation: Object,
    additionalAgreements: Array,
  },
  computed: {
    agreements() {
      return (this.reservation?.agreements || [])
          .map(agreement => ({ agreement }))
          .concat(this.additionalAgreements);
    }
  },

  methods: {
    submit() {
      this.submitting = true;
      this.submitAgreements(this.agreeds).then(() => {
        this.$emit('continue');
      }).catch(e => {
        console.log(e)
      }).finally(() => {
        this.submitting = false;
      })
    }
  },
  watch: {
    reservation: {
      immediate: true,
      handler() {
        const agreeds = [];
        const agreements = this.getCheckinData('agreements') || [];
         Array.from(new Set((agreements).map(a => a.id)))
            .forEach(id => {
              agreeds.push(agreements.find(ag => ag.id === id))
            })
        this.agreeds = agreeds;
      }
    },
    agreeds: {
      immediate: true,
      deep: true,
      handler(agreeds) {
        this.$emit('agreements', this.agreements.map(a => {
          a.agreed = agreeds.map(ag => ag.id).includes(a.agreement.id);
          return a;
        }))
      }
    }
  }
}
</script>