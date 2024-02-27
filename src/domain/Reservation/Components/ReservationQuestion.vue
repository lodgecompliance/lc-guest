<template>
    <v-card v-bind="$attrs">
        <v-card-text>
            <p>{{ question.question }} {{ !question.required ? '(optional)' : '' }}</p>
            <template v-if=" question.response_type === 'options' && question.options && question.options.length">
                <v-radio-group
                :rules="[(value) => question.required && !!value ? 'Select one of the options' : true]"
                v-model="response" 
                >
                    <v-radio
                        v-for="(option, o) in question.options" :key="o"
                        :label="option.option"
                        :value="option"
                    ></v-radio>
                </v-radio-group>
            </template>

            <v-date-picker
            v-else-if="question.response_type === 'date'"
            full-width
            v-model="response" 
            >
            </v-date-picker>

            <v-time-picker
            v-else-if="question.response_type === 'time'"
            full-width
            v-model="response"
            >
            </v-time-picker>

            <v-text-field 
            v-else-if="question.response_type === 'number'"
            type="number"
            outlined dense
            :rules="[(value) => question.required && !!value ? 'This field is required' : true]"
            v-model="response"
            placeholder="Your response..."
            ></v-text-field>

            <v-text-field 
            v-else
            type="text"
            outlined dense
            :rules="[(value) => question.required && !!value ? 'This field is required' : true]"
            v-model="response"
            placeholder="Your response..."
            >
            </v-text-field>
            <template v-if="response 
            && response.attachments 
            && response.attachments.questions 
            && response.attachments.questions.length">
                <reservation-question 
                v-bind="$attrs"
                v-for="(followUpQuestion, fq) in response.attachments.questions" 
                :key="`follow-up-${fq}`"
                :question="followUpQuestion"
                :prior-response="response"
                @response="followUpResponse"
                class="my-2"
                />

            </template>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "ReservationQuestion",
    data(){
        return {
            response: null,
        }
    },

    props: {
       question: Object,
       priorResponse: Object
    },

    methods: {
        responseInput(response) {
            if(!response) return;

            this.$emit('response', {
                ...this.question,
                response
            })
        },

        followUpResponse(response) {
            this.response.attachments.questions = this.response.attachments.questions.map(q => {
                return q.id === response.id
                    ? {
                      ...q,
                      response: q.response_type === 'options' ? { ...response.response } : { option: response.response } }
                    : q
            })
        }

    },

    watch: {

        response: {
            handler(response) {
                this.responseInput(response)
            }
        },

        question: {
            immediate: true,
            handler(){
                this.response = null
            }
        }
    }
}
</script>