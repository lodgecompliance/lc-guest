<template>
    <div>
        
        <div v-if="field == 'gender'">
            <v-radio-group
            v-bind="$attrs" 
            @change="(v) => $emit('input', v)"
            :rules="[rules.required]" 
            >
                <template #label>
                    <span class="text-capitalize">{{ field }}</span>
                </template>
                <v-radio
                    v-for="gender in genders" :key="gender.value"
                   v-bind="gender"
                ></v-radio>
            </v-radio-group>
        </div>
        <v-text-field
        v-else
        outlined
        :type="input.type"
        v-bind="$attrs"
        v-on="$listeners"
        :rules="input.rules" >
            <template #label>
                <span class="text-capitalize">{{ field }}</span>
            </template>
        </v-text-field>
    </div>
</template>

<script>
import formValidation from '@/helper/formValidation';
import { mapGetters } from 'vuex';
export default {
    name: "GuestInfoField",
    data() {
        return {
            rules: formValidation.rules,
            genders: [
                {
                    label: 'Male',
                    value: 'male'
                },
                {
                    label: 'Female',
                    value: 'female'
                },
                {
                    label: 'Other',
                    value: 'other'
                },
            ],
        }
    },
    props: {
        field: String
    },
    computed: {
        ...mapGetters([
            'current_user'
        ]),
        input() {
            const inputs = {
                age: {
                    type: 'number',
                    rules: [this.rules.required]
                },
                address: {
                    type: 'text',
                    rules: [this.rules.required]
                },
                email: {
                    type: 'email',
                    rules: [this.rules.email]
                },
                gender: {
                    type: 'radio',
                    rules: [this.rules.required]
                },
                phone: {
                    type: 'tel',
                    rules: [this.rules.required]
                },
            }
            return inputs[this.field]
        }
    },
}
</script>