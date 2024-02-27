<template>
    <div>
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

            <reservation-question
            outlined
            v-for="question  in questions" :key="question.id"
            :question="question"
            @response="responded"
            class="my-2"
            >
            </reservation-question>

        </div>
        <div v-else class="grey--text py-5 text-center">
            No question for the reservation
        </div>
    </div>
</template>

<script>
export default {
    name: "ReservationQuestions",
    data(){
        return {
            responses: [],
        }
    },

    props: {
       questions: Array
    },

    methods: {
        responded(response) {
            const index = this.responses.findIndex(r => r.id === response.id);
            this.responses.splice(index, 1, response);
        }
    },

    watch: {
        responses: {
            immediate: true,
            handler(responses){
                this.$emit('responses', responses)
            }
        },

        questions: {
            immediate: true,
            handler(questions){
                this.responses = questions ? questions.map(q => ({
                    ...q, 
                    response: null
                })) : []
            }
        }
    }
}
</script>