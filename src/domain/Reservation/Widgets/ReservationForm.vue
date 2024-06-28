<template>
    <data-container
        :loading="loading"
        :error="formError"
        @retry="init"
        class="pa-3 "
    >
      <div class="d-flex justify-center align-center">
        <div>
          <template v-if="!reservation">
            <v-form ref="form">
              <v-row justify="center" align="center">
                <v-col cols="12" sm="6">
                  <v-text-field
                      outlined
                      label="Name"
                      :rules="[rules.required]"
                      type="text"
                      name="name"
                      v-model="form.name"
                      class="required"
                      dense
                      hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                      outlined
                      label="Email"
                      :rules="[rules.required]"
                      type="text"
                      name="name"
                      v-model="form.email"
                      class="required"
                      dense
                      hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                      label="Room"
                      :rules="[]"
                      :items="rooms"
                      v-model="room"
                      dense outlined
                      return-object
                      hide-details
                      clearable
                  >
                    <template #selection="{ item: room }">
                      <span>{{ room.name }} ({{ room.amount | money(property.currency) }}) </span>
                    </template>
                    <template #item="{ item: room, on }">
                      <v-list-item v-on="on" :disabled="!room.available">
                        <v-list-item-avatar>
                          <v-avatar
                              color="primary"
                          >
                            <v-icon class="white--text text-h5">mdi-bed</v-icon>
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ room.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ room.amount | money(property.currency) }} </v-list-item-subtitle>
                          <v-list-item-subtitle v-if="!room.available">
                            <small class="red--text">Not Available</small>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                      outlined
                      label="Checkin Date"
                      :rules="[rules.required]"
                      type="date"
                      name="checkin_date"
                      v-model="form.checkin_date"
                      class="required"
                      :min="minCheckinDate"
                      dense
                      hide-details
                  ></v-text-field>
                </v-col>
                <v-col  cols="12" sm="4">
                  <v-text-field
                      outlined
                      label="Checkin Date"
                      :rules="[rules.required]"
                      type="date"
                      name="checkout_date"
                      v-model="form.checkout_date"
                      class="required"
                      :min="minCheckoutDate"
                      dense
                      hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="6" sm="10" class="py-0">
                  <p class="grey--text">Stay Duration: {{ stayDuration }} day<span v-show="stayDuration > 1">s</span></p>
                </v-col>
                <v-col cols="6" sm="2">
                  <v-btn
                      block
                      color="primary"
                      @click.prevent="submit"
                      :loading="submitting"
                      depressed
                  >Book
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
            <template v-if="property">
              <small class="grey--text">Creating reservation at {{ property.name }}</small>
            </template>
          </template>
          <template v-else>
            <template v-if="!checkedin">
              <div class="text-center">
                <h1>Reservation Created Successfully</h1>
                <p>You can continue to checkin </p>
                <v-btn color="primary" @click="continueToCheckin" depressed>Checkin Now</v-btn>
              </div>
            </template>
            <template v-else>
              <h1>Great!</h1>
              <p>Your checkin to {{ property.name }} was successful </p>
            </template>
          </template>
        </div>
      </div>
    </data-container>
</template>

<script>
import DataContainer from '../../../components/DataContainer';
import {mapActions, mapMutations} from "vuex";
import gql from "graphql-tag";
import form from "@/mixins/form";
import moment from "moment/moment";
import axios from "axios";
import config from "@/config";
export default {
    name: "ReservationForm",
    mixins: [form],
    components: {
      DataContainer
    },
    data(){ 
        return {
            loading: false,
            property: null,
            reservation: null,
            room: null,
            checkedin: false
        }
    },
    computed: {
      propertyId() {
        return this.$route.params.property;
      },

      minCheckinDate(){
        return moment().format('YYYY-MM-DD');
      },

      minCheckoutDate(){
        if(this.form.checkin_date) {
          return  moment(this.form.checkin_date).add(1, 'day').format('YYYY-MM-DD');
        }
        return moment().add(1, 'day').format('YYYY-MM-DD')
      },
      stayDuration() {
        if(this.form.checkin_date && this.form.checkout_date) {
          const checkin = moment(this.form.checkin_date);
          const checkout = moment(this.form.checkout_date);
          return checkout.diff(checkin, 'days');
        }
        return 0;
      },
      rooms() {
        return this.property?.rooms || []
      }
    },
    methods: {
      ...mapActions(['query']),
      ...mapMutations(['SET_CURRENT_PROPERTY']),

      init() {
          this.getProperty();
      },

      getProperty() {
        this.loading = true;
        this.query({
          query:  gql`
            query getPropertyById($id: ID!){
                getPropertyById(id: $id){
                    id
                    name
                    email
                    phone
                    image
                    currency
                    rooms {
                      id
                      name
                      description
                      amount
                      available
                    }
                    integrations {
                      api {
                        key
                      }
                    }
                }
            }`,
          variables: {
            id: this.propertyId
          }
        }).then(response => {
          this.property = response?.data?.getPropertyById
          this.SET_CURRENT_PROPERTY(this.property);
        })
        .catch(e => {
          this.formError = e
        })
        .finally(() => {
          this.loading = false
        })
      },

      createReservation() {
        return axios.create({
          baseURL: config.api.baseUrl,
          headers: {
            'Content-type': 'application/json',
            'x-property-api-key': this.property?.integrations?.api?.key
          }
        }).post("/reservation", {
          ...this.form,
          room: this.room?.name,
          balance: this.room?.amount,
          currency: this.property.currency,
        })
      },

      submission() {
        if(!this.$refs.form.validate()) return Promise.reject();
        return new Promise((resolve, reject) => {
          this.createReservation().then(response => {
            this.reservation = response.data;
            resolve(this.reservation);
          }).catch(e => reject(e))
        })
      },

      continueToCheckin() {
        if(this.reservation) {
          window.top.postMessage({ type: "created", reservation: this.reservation }, "*")
        }
      }
    },

    created() {
      const vue = this;
      window.addEventListener('message', (event) => {
        vue.checkedin = event.data.type === "checkedin";
      });
    },

    mounted(){
      this.init()
    },
}
</script>