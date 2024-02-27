<template>
  <v-chip
      class="text-capitalize"
      :color="color || (status && colors[status] ? colors[status] : colors.default)"
      v-bind="$attrs"
      small outlined label>
    {{ status | nullable }}
  </v-chip>
</template>

<script>
export default {
  name: "ItemStatus",
  data() {
    return {
      colors: {
        default: 'grey',
        enabled: 'green',
        success: 'green',
        approved: 'green',
        disabled: 'red',
        failed: 'red',
        declined: 'red',
        pending: 'warning'
      }
    }
  },
  props: {
    status: String,
    color: String
  },
}
</script>