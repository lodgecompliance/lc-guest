<template>
  <v-list-item>
    <v-list-item-content>
      <slot name="content" v-bind="{ metadata }">
        <template v-if="type === 'edge'">
          <div class="d-flex justify-space-between">
            <v-list-item-subtitle class="grey--text">{{ metadata.key }}</v-list-item-subtitle>
            <v-list-item-title class="text-right">{{ metadata.value | nullable }}</v-list-item-title>
          </div>
        </template>
        <template v-else>
          <v-list-item-subtitle class="grey--text">{{ metadata.key }}</v-list-item-subtitle>
          <v-list-item-title>{{ metadata.value | nullable }}</v-list-item-title>
        </template>
      </slot>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
    export default {
        name: "MetadataListItem",
        props: {
          metadata: Object,
          type: {
            type: String,
            default: () => 'stack'
          }
        }
    }
</script>


