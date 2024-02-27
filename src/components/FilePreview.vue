<template>
  <div>
    <slot v-bind="{ type, name, placeholder }">
      <v-img
          v-if="type === 'image'"
          :src="file"
          :height="deviceHeight"
          contain
      >
      </v-img>
      <video v-else-if="type === 'video'"
             :src="file"
             height="100%"
             controls
      ></video>
      <object v-else-if="type === 'document'"
              :data="file" type="application/pdf"
              width="100%" :height="deviceHeight">
        <div class="text-center pt-5">
          <p class="black--text">Unable to display document. <a :href="file">Download</a> instead.</p>
        </div>
      </object>
      <iframe
          v-else
          :src="file"
          :height="deviceHeight"
          width="100%"
          style="border: none"

      >
      </iframe>
    </slot>
  </div>
</template>

<script>
export default {
    name: "FilePreview",
    data(){
      return {
        fileType: null
      }
    },
    props: {
        file: {
          type: String,
          default: () => []
        }
    },
  computed: {
      extension() {
        return decodeURIComponent(this.file).split('.').pop()?.split('?').shift()
      },
      name() {
        return decodeURIComponent(this.file).split('/').pop()?.split('?').shift()
      },
      type() {
        if(['png', 'jpeg', 'jpg', 'gif', 'svg'].includes(this.extension)) return 'image';
        if(['mp4'].includes(this.extension)) return 'video';
        if(['pdf' ].includes(this.extension)) return 'document';
        return 'unknown'
      },
      placeholder() {
        return {
          image: this.file,
          'video': require(`../assets/img/video-placeholder.jpeg`),
          'document': require(`../assets/img/document-placeholder.jpeg`),
          'unknown': require(`../assets/img/document-placeholder.jpeg`),
        }[this.type]
      },
      deviceHeight() {
        return innerHeight - 120;
      }
  }
}
</script>