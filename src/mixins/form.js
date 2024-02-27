import formValidation from '@/helper/formValidation';
import {mapActions} from "vuex";
export default {
    data() {
       return {
           form: {},
           files: [],
           canSubmit: true,
           submitting: false,
           formError: null,
           alert: null,
           rules: formValidation.rules
       }
    },
    methods: {
        ...mapActions(['mutate', 'query']),
        submit() {
            if(typeof this.submission !== 'function') return;
            this.formError = null;
            this.submitting = true;
            this.submission()
            .catch(e => {
                this.formError = e
            })
            .finally(() => {
                this.submitting = false
            })
        }
    },

    mounted() {
        if(typeof this.setForm !== 'function') return;
        this.setForm();
    }
}