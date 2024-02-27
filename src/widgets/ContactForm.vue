<template>
  <v-form ref="form">

    <v-select
        v-model="form.category"
        :items="categories"
        dense
        outlined
        label="Question/Complaint Category"
        placeholder="Select category"
        :rules="[rules.required]"
    >
    </v-select>

    <v-text-field
        v-model="form.subject"
        dense
        outlined
        label="Subject"
        placeholder="Enter subject"
        :rules="[rules.required]"
    ></v-text-field>

    <v-textarea
        v-model="form.message"
        dense
        outlined
        label="Description"
        placeholder="Type detailed description"
        :rules="[rules.required]"
    >
    </v-textarea>

    <error-handler :error="formError" :can-retry="false" @retry="submit" />

    <v-btn
    color="primary"
    depressed block
    :loading="submitting"
    @click="submit"
    >Submit</v-btn>

  </v-form>
</template>

<script>
import form from "@/mixins/form";
import ErrorHandler from "@/components/ErrorHandler";
import {mapActions} from "vuex";
import gql from "graphql-tag";

export default {
  name: "ContactForm",
  components: {ErrorHandler},
  mixins: [form],
  data() {
    return {
      categories: [
        "Account", "Reservation", "Property"
      ]
    }
  },
  props: {
    prefill: Object,
  },
  methods: {
    ...mapActions(['mutate']),
    submission() {
      return new Promise((resolve, reject) => {
        if(!this.$refs.form.validate()) return reject({ message: "Some fields are not filled correctly" });
        this.mutate({
          mutation: gql`mutation submitContactForm($data: ContactFormInput!) {
            submitContactForm(data: $data)
          }`,
          variables: {
            data: {
              ...this.form,
              metadata: (this.form.metadata || []).concat([
                { key: "user_id", value: this.$store.getters.current_user?.auth?.uid }
              ])
            }
          }
        }).then(response => {
          if(response.data.submitContactForm) {
            this.$emit("submitted");
            this.$store.commit("SNACKBAR", {
              status: true,
              text: `Your message has been delivered`,
              color: 'success'
            })
            return resolve(true)
          }
           return  reject({ message: "Oops! Can't deliver your message at the moment" })
        })
      })
    }
  },
  watch: {
    prefill: {
      immediate: true,
      handler(form) {
        if(form) this.form = form
      }
    }
  }
}
</script>