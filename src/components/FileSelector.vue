<template>
  <div>
    <slot v-bind="{ selectNewFile }">
      <div class="select-file"
           :style="`border: 2px dotted ${$vuetify.theme.currentTheme.primary};`"
      >
        <v-btn
            color="primary"
            :loading="loading"
            small outlined
            @click="selectNewFile"
        ><v-icon small>mdi-file</v-icon> Click to select Files</v-btn>
      </div>
    </slot>
    <input
        :id="`file-input-${_uid}`"
        ref="filePicker"
        type="file"
        style="display: none"
        @change="filesSelected"
        v-bind="$attrs"
    >
  </div>
</template>

<script>
export default {
  name: "FileSelector",
  props: {
    loading: Boolean,
  },
  methods: {
    selectNewFile() {
      this.$refs.filePicker.click();
    },
    filesSelected(e) {
      this.$emit('files', e.target.files)
    }
  }
}
</script>

<style>
  .select-file {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px 5px;
    background-color: #eeeeee;
    border-radius: 5px;
    cursor: pointer;
  }
</style>