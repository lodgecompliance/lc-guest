<template>
  <v-dialog v-model="dialog" width="350">
      <template #activator="{ on }">
        <slot v-bind="{ on }">
          <v-btn v-on="on" color="primary" small text>Raise Dispute</v-btn>
        </slot>
      </template>
      <v-card :loading="submitting" flat>
        <slot name="header">
          <v-card-title>
            Raise a Dispute
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
          </v-card-title>
        </slot>
        <v-card-text>
          <v-form ref="form" @submit.prevent>
            <v-text-field
                outlined
                label="Title"
                placeholder="Enter dispute title"
                :rules="[rules.required]"
                type="text"
                v-model="form.title"
                class="required"
                dense
            ></v-text-field>
            <v-textarea
                outlined
                label="Description"
                placeholder="Enter dispute description"
                class="required"
                v-model="form.description"
                dense
                :rules="[rules.required]"
                :hide-details="true"
            ></v-textarea>
            <p class="grey--text mt-2">
              <v-icon>mdi-information</v-icon>
              Note that the host will be notified of your dispute
            </p>
            <error-handler :error="formError" :can-retry="false" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn
              color="primary"
              @click.prevent="submit"
              :loading="submitting"
              depressed
          >
            Send Message
          </v-btn>
        </v-card-actions>
      </v-card>

  </v-dialog>

</template>

<script>
import { mapActions } from 'vuex';
import form from '@/mixins/form';
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler";

const QLFields = `
id
title
description
amount
files
created_by {
  id
  full_name
}
resolution {
  resolved_by {
    id
    full_name
  }
  resolved_at
}
dispute {
  title
  description
  files
  disputed_at
}
timestamp {
  created_at
  updated_at
}
`
export default {
  name: "ReservationDamageDispute",
  components: {ErrorHandler},
  mixins: [form],
  data(){
      return {
        dialog: false
      }
  },
  props: {
      reservation: Object,
      damage: Object,
  },
  methods: {

    ...mapActions([
        'query',
        'mutate'
    ]),

    setForm() {
      this.form = {
        title: null,
        description: null,
        files: [],
      }
    },

    resetForm() {
      this.$refs.form.reset();
      this.setForm();
    },

    submission() {
      if(!this.$refs.form.validate()) return Promise.reject(new Error("Fill all necessary fields"));
      return new Promise((resolve, reject) => {
        this.mutate({
          mutation: gql `mutation createReservationDamageDispute($reservation_id: ID!, $damage_id: ID!, $data: ReservationDamageDisputeInput!) {
            createReservationDamageDispute(reservation_id: $reservation_id, damage_id: $damage_id, data: $data) {
              ${QLFields}
            }
          }`,
          variables: {
            reservation_id: this.reservation.id,
            damage_id: this.damage.id,
            data: this.form
          }
        }).then(response => {
          this.resetForm();
          const damage = response.data.createReservationDamageDispute;
          this.$store.commit("SNACKBAR", {
            status: true,
            text: `Dispute raised`,
            color: "success"
          })
          this.$emit('damage-disputed', damage);
          this.dialog = false;
          resolve(damage)
        }).catch(e => reject(e))
      })
    }
  },

  watch: {
    damage: {
      immediate: true,
      handler() {
        this.setForm()
      }
    }
  }
}
</script>