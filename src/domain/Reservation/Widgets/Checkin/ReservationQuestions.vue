<template>
    <v-card>
      <v-card-text>
        <p>Questions required by the host to be answered for your checkin</p>
        <div v-if="questions.length">
          <!-- <v-card v-for="(response, i) in responses" :key="i" class="my-1">
              <v-card-text>
                  <p>{{ response.question }} {{ !response.required ? '(optional)' : '' }}</p>
                  <template v-if="response.options && response.options.length">
                      <v-radio-group
                      v-model="responses[i].response"
                      :rules="[(value) => response.required && (value == '' || !value) ? 'Select one of the options' : true]"
                      >
                          <v-radio
                              v-for="(option, o) in response.options" :key="o"
                              :label="option.option"
                              :value="option"
                          ></v-radio>
                      </v-radio-group>
                  </template>
                  <v-text-field
                  v-else
                  :label="`${response.question} ${!response.required ? '(optional)' : ''}`"
                  :rules="[(value) => response.required && (value == '' || !value) ? 'This field is required' : true]"
                  v-model="responses[i].response"
                  >
                  </v-text-field>
              </v-card-text>
          </v-card> -->

          <v-form ref="form">
            <reservation-question
                outlined
                v-for="question  in questions" :key="question.id"
                :question="question"
                @response="responded"
                class="my-2"
            >
            </reservation-question>
          </v-form>
        </div>
        <div v-else class="grey--text py-5 text-center">
          No question for the reservation
        </div>
      </v-card-text>
      <v-card-actions>
        <slot v-bind="{ questions: responses, submitting, submit }">
          <v-btn color="primary" :loading="submitting" @click="submit" depressed>Continue</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
</template>

<script>
import session from "@/domain/Reservation/Mixins/session";

export default {
    name: "ReservationQuestions",
    mixins: [session],
    data(){
        return {
            submitting: false,
            responses: [],
        }
    },

    props: {
      reservation: Object,
    },

    computed: {

      questions() {
        return (this.reservation?.questions || []).map(q => ({
          ...q,
          response: this.normalizedResponses.find(rq => q.id === rq.id)?.response
        }))
      },

      normalizedResponses() {
        return this.responses.map(question => {
          const response = typeof(question.response) === 'string'
              ? {
                option: question.response,
              }
              : question.response;

          return {
            ...question,
            response
          }
        });
      },
    },

    methods: {
        responded(response) {
            const index = this.responses.findIndex(r => r.id === response.id);
            this.responses.splice(index, 1, response);
        },
        submit() {
          if(!this.$refs.form.validate()) return;
          this.submitting = true;
          this.submitQuestions(this.normalizedResponses).then(() => {
            this.$emit('continue', this.normalizedResponses);
          }).catch(e => {
            console.log(e)
          }).finally(() => {
            this.submitting = false;
          })
        }
    },

    watch: {
      reservation: {
        immediate: true,
        handler(r) {
          const answered = this.getCheckinData('questions') || []
          this.responses = this.questions.map(q => {
            return {
              ...q,
              response: answered.find(a => a.id === q.id)?.response
            }
          });
        }
      },
      questions: {
        immediate: true,
        deep: true,
        handler(q) {
          this.$emit('questions', q)
        }
      }
    }
}
</script>