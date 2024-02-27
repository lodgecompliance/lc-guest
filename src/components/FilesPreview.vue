<template>
  <section>
    <v-row>
      <v-col
          v-for="(file, i) in files"
          :key="i"
          :cols="displayType === 'grid' ? 12/grid : 12"
          class="pa-0"
      >
        <file-preview :file="file">
          <template #default="{ type, name, placeholder }">
            <slot name="file-preview" v-bind="{ file, type, name, placeholder, index: i, view, remove }">
              <div
                  v-if="displayType === 'list'"
                  class="d-flex justify-space-between align-center my-1 py-1"
                  style="background-color: #eee; border-radius: 3px"
              >
                <div class="d-flex flex-nowrap text-truncate">
                  <v-img
                      :src="placeholder"
                      width="20px"
                      height="20px"
                      class="ml-2"
                  ></v-img>
                  <span class="ml-2">{{ name }}</span>
                </div>
                <div class="mr-1">
                  <v-btn small icon @click="view(file)">
                    <v-icon color="grey" small>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn v-if="allowRemove" small icon @click="remove(i)">
                    <v-icon color="red" small>mdi-delete</v-icon>
                  </v-btn>
                </div>

              </div>
              <v-img
                  v-else
                  :src="placeholder"
                  :height="itemHeight"
                  gradient="to bottom, rgba(0,0,0,.5), rgba(0,0,0,.1)"
              >
                <slot v-bind="{ file, type, name, placeholder, index: i, view, remove }">
                  <div class="d-flex justify-end pa-2">
                    <v-btn dark icon @click="view(file)">
                      <v-icon>mdi-arrow-expand-all</v-icon>
                    </v-btn>
                    <v-btn v-if="allowRemove" dark icon @click="remove(i)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </slot>
              </v-img>
            </slot>
          </template>
        </file-preview>
      </v-col>
    </v-row>

    <v-dialog
        v-model="dialog"
        persistent
        scrollable
        fullscreen
    >
      <v-card>
        <slot name="header" v-bind="{ closeDialog }">
          <v-card-title class="d-flex justify-space-between flex-nowrap">
            <file-preview v-if="currentPreview" :file="currentPreview">
              <template #default="{ name, placeholder }">
                <div class="d-flex align-center flex-nowrap">
                  <v-img
                      :src="placeholder"
                      width="20px"
                      height="20px"
                      class="ml-2"
                  ></v-img>
                  <span class="ml-2 text-truncate" :style="`max-width: ${previewNameWidth}px`">{{ name }}</span>
                  <v-btn
                      :href="currentPreview"
                      target="_blank"
                      color="primary"
                      download="download"
                      class="ml-2"
                      icon
                  >
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                </div>
              </template>
            </file-preview>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
        </slot>
        <v-carousel v-model="carousel" height="100%">
          <v-carousel-item
              v-for="(file, i) in files"
              :key="`file-${i}`"
          >
            <file-preview :file="file" />
          </v-carousel-item>
        </v-carousel>
        <slot name="footer" v-bind="{ remove }"></slot>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import FilePreview from "@/components/FilePreview";
export default {
  name: "FilesPreview",
  components: {FilePreview},
  data() {
    return {
      files: [],
      carousel: null,
      dialog: false
    }
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    grid: {
      type: Number,
      default: () => 2
    },
    itemHeight: {
      type: Number,
      default: () => 100
    },
    allowRemove: {
      type: Boolean,
      default: () => true
    },
    displayType: {
      type: String,
      default: () => 'grid'
    }
  },
  computed: {
    currentPreview() {
      return this.carousel >= 0 ? this.files[this.carousel] : null
    },
    previewNameWidth() {
      return innerWidth - 200
    }
  },
  methods: {
    view(file) {
      this.carousel = this.files.findIndex(f => f === file);
      this.dialog = true
    },
    remove(index){
      this.files.splice(index, 1)
    },
    closeDialog() {
      this.dialog = false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(files) {
        this.files = files
      }
    }
  }
}
</script>