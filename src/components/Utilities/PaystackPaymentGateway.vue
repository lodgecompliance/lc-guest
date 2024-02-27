<template>
      <div>
        <data-container :loading="initializing">
            <template #loading>
                <div class="py-5 grey--text text-center">
                    Hold on while we initialize gateway...
                </div>
            </template>
            <v-alert v-if="initError" color="error">Unable to initialize gateway right now</v-alert>
        </data-container>

        <slot v-bind="pay" />

      </div>
</template>


<script>
    import DataContainer from '../../components/DataContainer.vue';
    export default {
        name: "PaystackPaymentGateway",
        components: {
           DataContainer
        },
        data(){
            return {
                initError: null,
                initializing: false,
            }
        },
        props: {
            setup: Object,
        },

        computed: {
            
        },

        methods: {

            setPaystack()
            {
                this.initializing = true;
                 /* eslint-disable */
                return new Promise((resolve, reject) => {                    
                    if(document.querySelector("[data-paystack='true']") !== null){
                        this.initializing = false;
                        resolve();
                        return;
                    }
                    let paystackScript = document.createElement('script')
                    paystackScript.setAttribute('src', 'https://js.paystack.co/v1/inline.js');
                    document.head.appendChild(paystackScript);
                    paystackScript.onload = () => {
                        paystackScript.setAttribute('data-paystack', 'true');
                        this.initializing = false;
                        resolve();
                    };
                    paystackScript.onerror = (e) => {
                        reject(e);
                    }; 
                })
            },

            pay() {
                this.setPaystack().then(() => {
                    if(this.setup) {
                        const paystack = PaystackPop.setup({
                            ...this.setup,
                            callback: (response) => {
                                this.$emit('callback', response);
                            }
                        })
                        
                        paystack.openIframe()
                    }
                });
            }

        },

        mounted(){
            // this.setPaystack();
        },

        watch: {
            initializing: {
                immediate: true,
                handler(val) {
                    this.$emit('loading', val)
                }
            }
        }

       
    }
</script>