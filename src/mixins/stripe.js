export default {
    data() {
        return {
            stripe: null,
            card: null,
            initializing: false,
            initError: null,
            process: '',
        }
    },
    methods: {
        initializeStripeSDK(publishableKey, stripeAccount)
        {
            this.initializing = true;
            this.setStripe(publishableKey, stripeAccount)
                .then(() => {
                    const elements = this.stripe.elements();
                    const style = {
                        base: {
                            fontSize: '16px',
                            color: '#32325d',
                        },
                    };

                    // Create an instance of the card Element.
                    this.card = elements.create('card', {style: style});
                    // Add an instance of the card Element into the `card-element` <div>.
                    if(document.querySelector(`#card-element-${this._uid}`))
                        this.card.mount(`#card-element-${this._uid}`);

                })
                .catch(e => {
                    // this.$store.commit('APP_ERROR', e);
                    console.log(e, e.message)
                    this.initError = e;
                })
                .finally(() => {
                    this.initializing = false;
                })

        },

        setStripe(publishableKey, stripeAccount)
        {
            /* eslint-disable */
            return new Promise((resolve, reject) => {
                if(document.querySelector("[data-stripe='true']") !== null) {
                    this.stripe = Stripe(publishableKey, {
                        stripeAccount: stripeAccount ? stripeAccount : undefined
                    });
                    this.$emit('gateway-initialized');
                    resolve();
                    return;
                }
                this.process = `Initializing payment gateway...`;
                let stripeScript = document.createElement('script')
                stripeScript.setAttribute('src', 'https://js.stripe.com/v3/');
                document.head.appendChild(stripeScript);
                stripeScript.onload = () => {
                    this.$emit('gateway-initialized');
                    stripeScript.setAttribute('data-stripe', 'true');
                    this.process = '';
                    this.stripe = Stripe(publishableKey, {
                        stripeAccount: stripeAccount ? stripeAccount : undefined
                    });
                    resolve();
                };
                stripeScript.onerror = (e) => {
                    this.process = '';
                    reject(e);
                };
            })
        },

        confirmPaymentWithSDK(intent, payment_method) {
            return this.stripe.confirmCardPayment(intent.client_secret, { payment_method })
        },

        confirmCardSetupWithSDK(intent) {
            return this.stripe.confirmCardSetup(intent.client_secret, {
                payment_method: {
                    card: this.card,
                    billing_details: {
                        name: [this.$store.getters.current_user.profile.first_name, this.$store.getters.current_user.profile.first_name].join(' ')
                    }
                },
            })
        },
    }
}