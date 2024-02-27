<template>
      <div>
        <slot v-bind="{ document, selectNewFile, uploadFiles }">
          <file-selector
              ref="fileSelector"
              @files="uploadFiles" />
        </slot>
        <input
            :id="`file-input-${_uid}`"
            ref="filePicker"
            type="file"
            style="display: none"
            @change="(e) => uploadFiles(e.target.files)"
            v-bind="$attrs"
        >
        <error-handler :error="error" />
      </div>
</template>

<script>
import fileHelper from '@/helper/file';
import validation from '@/helper/formValidation';
import ErrorHandler from "@/components/ErrorHandler";
import FileSelector from "@/components/FileSelector";
export default {
  name: "FileUpload",
  components: {FileSelector, ErrorHandler},
  data(){
        return {
          upload: false,
          saving: false,
          document: {
                  file: null,
                  upload_progress: 0,
                  uploaded: false,
                  file_url: null,
                  uploading: false,
              },
          rules: validation.rules,
          previewContainer: "#document-preview",
          error: null
        }
    },
    computed:{
      previews() {
        if(!this.value) return [];
        if(this.value instanceof Array) return this.value;
        return [this.value]
      },
      isMultiple() {
        return this.$attrs.multiple !== undefined
      }
    },

    props: {
      value: [String, Array],
      path: {
        type: String,
        default: () => "private/identity"
      },
      customPreview: {
        type: Boolean,
        default: () => false
      },
      allowedExtensions: {
        type: Array,
        default: () => []
      }
    },
    methods: {

      selectNewFile() {
        this.$refs.filePicker.click();
      },

      uploadFile(file){
        return new Promise((resolve, reject) => {
          if(!file) return resolve(null);
          if(this.allowedExtensions.length) {
            const ext = file.name.split('.')[1];
            if(!this.allowedExtensions.includes(ext)) return reject(new Error(`${ext} not allowed`))
          }
          const saveAs = `${this.path}/${file.name}`;
          const uploadTask = fileHelper.uploadFile(file, saveAs);
          uploadTask.on('state_changed', (snapshot) => {

          }, (error) => {
            reject(error)
          }, () => {
            // Handle successful uploads on complete
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              resolve(downloadURL)
            });
          });
        })
      },

      uploadFiles(files) {
        if(!files) return;
        this.document.uploading = true;
        this.document.file = this.isMultiple ? files : files[0]
        Promise.all(Array.from(files).map(file => this.uploadFile(file))).then(urls => {
          urls = urls.filter(url => !!url);
          this.document.file_url = this.isMultiple ? this.previews.concat(urls) : urls.pop();
          this.document.uploaded = true;
          this.$emit("input", this.document.file_url);
        })
        .catch(e => {
          this.error = e;
        })
        .finally(() => {
          this.document.uploading = false;
        })
      },
    },
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