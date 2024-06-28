export  default class Checkin {

    constructor(checkin = {}) {
        this.payments = checkin?.payments;
        this.agreements = checkin?.agreements;
        this.questions = checkin?.questions;
    }

    getChargeStripePayment(charge) {
        if(this.payments && this.payments.stripe) {
            return this.payments.stripe.find(p => p.metadata.charge_id === charge.id);
        }
        return null;
    }

    getChargePaystackPayment(charge) {
        if(this.payments && this.payments.paystack) {
            const transaction = this.payments.paystack.find(transaction => {
                return transaction.charges.map(charge => charge.metadata.charge_id)
                .includes(charge.id);
            });

            if(transaction) {
                return {
                    transaction,
                    charge: transaction.charges.find(c => c.metadata.charge_id === charge.id)
                }
            }
        }
        return null;
    }

    chargePayment(charge) {
        const stripePayment = this.getChargeStripePayment(charge);
        const paystackPayment = this.getChargePaystackPayment(charge);
      
        if(stripePayment) {
            return {
                gateway: 'stripe',
                payment: stripePayment,
            }
        }

        if(paystackPayment && paystackPayment.transaction && paystackPayment.charge) {
            return {
                gateway: 'paystack',
                payment:  paystackPayment,
            }
        }

        return null;
    }

    agreementAgreed(agreement) {
        return (this.agreements || []).find(a => a.id === agreement.id)
    }

    questionResponse(question) {
        const questionInCheckin = (this.questions || []).find(q => q.id === question.id);
        return questionInCheckin ? questionInCheckin.response : null;
    }

}