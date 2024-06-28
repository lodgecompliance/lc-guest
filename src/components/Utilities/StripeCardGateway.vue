<template>
      <div>
        <data-container :loading="initializing">
            <template #loading>
                <div class="py-5 grey--text text-center">
                    Hold on while we initialize gateway...
                </div>
            </template>
            <v-alert v-if="initError" color="error"
            colored-border
            border="left"
            >
                Unable to initialize gateway right now
            </v-alert>
        </data-container>

        <v-form ref="cardForm">
            <div  :class="{'d-none': !useCustomCard }">
                <v-text-field outlined label="Card Number" v-model="customCard.number" :rules="[rules.required]"></v-text-field>
                <v-row>
                    <v-col>
                        <v-text-field type="number" outlined label="Exp Month" v-model="customCard.exp_month" :rules="[rules.required]"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field type="number" outlined label="Exp Year" v-model="customCard.exp_year" :rules="[rules.required]"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field outlined label="CVC" v-model="customCard.cvc" :rules="[rules.required]"></v-text-field>
                    </v-col>
                </v-row>
            </div>
            
            <div class="my-3" :class="{'d-none': useCustomCard || initializing || initError != null }">
                <div  class="my-3" :id="`card-element-${_uid}`">
                <!-- A Stripe Element will be inserted here. -->
                </div>
                <!-- Used to display Element errors. -->
                <div id="card-errors" class="text-danger" role="alert">{{cardError}}</div>
            </div>
            
        </v-form>
        <div class="my-5">
                <v-alert 
                    v-if="processing"
                    border="left"
                    colored-border
                    type="info"
                >
                {{process}}
            </v-alert>
        </div>
        <div>
            <v-btn @click="submit" color="primary" :loading="processing" :disabled="initError != null" small depressed text>
                <slot name="submit-btn-text">{{ preAuthorize ? 'Authorize' : 'Pay' }} {{ currency }}{{ amount }}</slot> 
            </v-btn>
        </div>
      </div>
</template>


<script>
    import validation from '@/helper/formValidation';
    import DataContainer from '../DataContainer';
    import stripe from "@/mixins/stripe";
    export default {
        name: "StripeCardGateway",
        mixins: [stripe],
        components: {
           DataContainer
        },
        data(){
            return {
                cardError: null,
                customCard: {
                    number: null,
                    exp_month: null,
                    exp_year: null,
                    cvc: null
                },
                rules: validation.rules,
            }
        },
        props: {
            publishableKey: {
              type: String,
              required: true,
            },
            stripeAccount: String,
            amount: Number,
            tokenCallback: Function,
            createIntent: Function,
            currency: String,
            preAuthorize: Boolean,
            type: String
        },

        computed: {
            processing(){
                return this.process !== ''
            },

            useCustomCard() {
                return this.type === 'create-card-3dx'
            }
        },

        methods: {
          close(){
                this.process = '';
                this.card = null;
            },

          submit(){
              if(this.useCustomCard && !this.$refs.cardForm.validate()) return;
              this.$emit('error', null);

              if(this.type === 'confirm-card-payment') this.confirmCardPayment();
              if(this.type === 'create-token') this.createToken();
              if(this.type === 'confirm-setup') this.confirmSetup();
          },

          createToken(){
             const vm = this
             this.process = "Please wait...";
              // Create a token or display an error when the form is submitted.
              vm.stripe.createToken(this.card)
              .then((response) => {
                  if (response.error) {
                      vm.$emit('error', response.error)
                      vm.process = '';
                      return Promise.resolve();
                  } else {
                      this.$emit('token-created', response.token);
                      return this.tokenCallback(response.token)
                  }
              })
              .then(response => {
                  this.$emit('token-callback', response);
              })
              .catch(e => {
                  vm.$emit('error', e);
              })
              .finally(() => {
                  this.process = "";
              })
          },

          confirmCardPayment() {
              const vm = this
              this.process = "Processing...";
              vm.createIntent()
              .then(intent => {
                  if(intent) return vm.confirmPaymentWithSDK(intent)
                  return Promise.resolve();
              })
              .then(result => {
                  if(!result) {
                      vm.$emit('error', {
                          message: 'Could not create intent'
                      });
                      return;
                  }
                  // console.log('Result from card payment---->', result);

                  if(result.error) vm.$emit('error', result.error)
                  else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                      vm.$emit('card-payment-confirmed', result.paymentIntent);
                  }
              })
              .catch(e => {
                  vm.$emit('error', e);
              })
              .finally(() => {
                  this.process = "";
              })

          },

          confirmSetup() {
                const vm = this
                this.process = "Processing...";
                vm.createIntent()
                .then(intent => { 
                    if(intent) return vm.confirmCardSetupWithSDK(intent)
                    return Promise.resolve();
                })
                .then(result => {
                    if(!result) {
                        vm.$emit('error', {
                            message: 'Could not create intent'
                        });
                        return;
                    }
                    // console.log('Result from setup intent---->', result);

                    if(result.error) vm.$emit('error', result.error)
                    else if (result.setupIntent) {
                        vm.$emit('setup-confirmed', result.setupIntent);
                    }
                })
                .catch(e => {
                    vm.$emit('error', e);
                })
                .finally(() => {
                    this.process = "";
                })
               
            },

          cancel(){
              this.close()
              this.$emit('abort');
          }
        },
      mounted(){
        this.initializeStripeSDK(this.publishableKey, this.stripeAccount);
      }
       
    }
</script>

<style scoped>
    /* *
    * The CSS shown here will not be introduced in the Quickstart guide, but shows
    * how you can use CSS to style your Element's container.
    */
    .StripeElement {
    box-sizing: border-box;

    height: 40px;

    padding: 10px 12px;

    border: 1px solid transparent;
    border-radius: 4px;
    background-color: white;

    box-shadow: 0 1px 3px 0 #e6ebf1;
    -webkit-transition: box-shadow 150ms ease;
    transition: box-shadow 150ms ease;
    }

    .StripeElement--focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
    }

    .StripeElement--invalid {
    border-color: #fa755a;
    }

    .StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
    }
</style>