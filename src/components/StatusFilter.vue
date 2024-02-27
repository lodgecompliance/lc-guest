<template>
  <v-select
      :items="statuses"
      item-text="label"
      item-value="value"
      v-bind="$attrs"
      v-on="$listeners"
  >
  </v-select>
</template>

<script>
export default {
  name: "StatusFilter",
  data() {
    return {
      status: null,
    }
  },
  props: {
    defaultStatus: Object,
    collection: { type: Array, default: () => [] }
  },
  computed: {
    groupCollection() {
      return this.groupData(this.collection, "status");
    },
    statuses() {
      const defaultStatus = this.defaultStatus && ["label","value"].every(key => this.defaultStatus.hasOwnProperty(key))
      ? [this.defaultStatus] : [];
      return defaultStatus.concat(Object.keys(this.groupCollection).filter(key => key !== 'null').map(status => {
        return {
          label: this.$options.filters.ucfirstword(this.$options.filters.replace_underscore(status)),
          value: status
        }
      }))
    }
  },
  mounted() {
    let defaultStatus = this.status;
    if(this.defaultStatus) {
      defaultStatus = this.statuses.find(s => s.value === this.defaultStatus.value);
    }
    this.status = defaultStatus || (this.statuses.length ? this.statuses[0] : null);
  },
  watch: {
    status: {
      immediate: true,
      handler(status) {
        if(status && status.value) {
          this.$emit("input", status.value);
        }
      }
    }
  }
}
</script>

