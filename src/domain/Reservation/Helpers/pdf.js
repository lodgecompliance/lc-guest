import moment from "moment";
import checkinHelper from './checkin';

const dateFormat = 'LL';

const renderValue = value => value ? value : 'N/A';

const renderCharges = (reservation, checkin = null) => {
    const { currency, charges } = reservation;
    const checkinUtil = new checkinHelper(checkin);
    if(charges && charges.length) {
        return {
            ol: charges.map(charge => {
                let theCharge = [
                    {text: `${charge.title} - ${currency}${charge.amount}`, ...styles.regular, bold: true},
                    {text: renderValue(charge.description), ...styles.regular},
                    {text: `Type: ${renderValue(charge.type)}`, ...styles.regular},
                ];

                if(checkin) {
                    let payment = checkinUtil.chargePayment(charge);
                    let paymentContent = [
                        {text: "Payment", ...styles.regular, bold: true}
                    ]
                    if(payment) {
                        if(payment.gateway === 'paystack') {
                            paymentContent.push({text: `Amount paid: ${payment.payment.charge.currency}${payment.payment.charge.amount/100}`, ...styles.regular})
                            paymentContent.push({text: `via: ${payment.gateway}`, ...styles.regular})
                        } 
                        else if(payment.gateway === 'stripe') {
                            paymentContent.push({text: `Amount paid: ${payment.payment.currency}${payment.payment.amount_captured/100}`, ...styles.regular})
                            paymentContent.push({text: `via: ${payment.gateway}`, ...styles.regular})
                        }
                    } else {
                        paymentContent.push({text: 'No payment found', ...styles.quote})
                    }
                    theCharge = theCharge.concat(paymentContent)
                }
                return theCharge;
            })
        } 
    }
    return {text: 'No charge', ...styles.quote}
}

const renderAgreements = (reservation, checkin =  null) => {
    const { agreements } = reservation;
    const checkinUtil = new checkinHelper(checkin);

    if(agreements && agreements.length) {
        return {
            ol: agreements.map(agreement => {
                let agreementContent = [
                    {text: agreement.agreement, ...styles.regular, bold: true},
                    {text: renderValue(agreement.text ? agreement.text : agreement.link ), ...styles.regular},
                ]
                if(checkin) {
                    agreementContent.push({
                        text: `Agreed: ${checkinUtil.agreementAgreed(agreement) ? 'YES' : 'NO'}`,
                        ...styles.regular
                    })
                }
                return agreementContent;
            })
        }  
    }
    return {text: 'No agreement', ...styles.quote}
}

const renderQuestions = (reservation, checkin = null) => {
    const { questions } = reservation;
    const checkinUtil = new checkinHelper(checkin);

    if(questions && questions.length) {
        return {
            ol: questions.map(question => {
                const content = [
                    {text: question.question, ...styles.regular, bold: true},
                    {text: renderValue(`Response Type: ${question.response_type}`), ...styles.regular},
                ];
                if(question.response_type == 'options' && question.options && question.options.length) {
                    content.push({text: `Options: ${question.options.map((option, i) => `${option.option}${i < question.options.length - 1 ? ' | ' : ''}`)}`, ...styles.regular})
                }

                if(checkin) {
                    const response = checkinUtil.questionResponse(question);
                    content.push({
                        text: `Response: ${renderValue(response?.option)}`,
                        ...styles.regular
                    })
                    if(response?.attachments) {
                        // Attached agreements
                        if(response.attachments.agreements && response.attachments.agreements.length) {
                            content.push({text: "Attached Agreements", ...styles.regular, bold: true},)
                            content.push({
                                ol: response.attachments.agreements.map(agreement => {
                                    return [
                                        {text: agreement.agreement, ...styles.regular, bold: true},
                                        {text: renderValue(agreement.text ? agreement.text : agreement.link), ...styles.regular},
                                    ];
                                })
                            })
                        }

                        // Attached charges
                        if(response.attachments.charges && response.attachments.charges.length) {
                            content.push({text: "Attached Charges", ...styles.regular, bold: true},)
                            content.push({
                                ol: response.attachments.charges.map(charge => {
                                    let theCharge = [
                                        {text: `${charge.title} - ${charge.currency.toUpperCase()}${charge.amount}`, ...styles.regular, bold: true},
                                        {text: renderValue(charge.description), ...styles.regular},
                                        {text: `Type: ${renderValue(charge.type)}`, ...styles.regular},
                                    ];
                    
                                    if(checkin) {
                                        let payment = checkinUtil.chargePayment(charge);
                                        let paymentContent = [
                                            {text: "Payment", ...styles.regular, bold: true}
                                        ]
                                        if(payment) {
                                            if(payment.gateway === 'paystack') {
                                                paymentContent.push({text: `Amount paid: ${payment.payment.charge.currency}${payment.payment.charge.amount/100}`, ...styles.regular})
                                                paymentContent.push({text: `via: ${payment.gateway}`, ...styles.regular})
                                            } 
                                            else if(payment.gateway === 'stripe') {
                                                paymentContent.push({text: `Amount paid: ${payment.payment.currency}${payment.payment.amount_captured/100}`, ...styles.regular})
                                                paymentContent.push({text: `via: ${payment.gateway}`, ...styles.regular})
                                            }
                                        } else {
                                            paymentContent.push({text: 'No payment found', ...styles.quote})
                                        }
                                        theCharge = theCharge.concat(paymentContent)
                                    }
                                    return theCharge;
                                })
                            })
                        }

                        // Attached Questions
                        if(response.attachments.questions && response.attachments.questions.length) {
                            content.push({text: "Attached Questions", ...styles.regular, bold: true},)
                            content.push({
                                ol: response.attachments.questions.map(question => {
                                    const questionContent = [
                                        {text: question.question, ...styles.regular, bold: true},
                                        {text: renderValue(`Response Type: ${question.response_type}`), ...styles.regular},
                                        {text: renderValue(`Response: ${renderValue(question.response.option)}`), ...styles.regular},
                                    ];
                                    return questionContent;
                                })
                            })
                        }
                    }
                    
                }

                return content; 
            })
        } 
    }
    return {text: 'No question', ...styles.quote}
}

const renderIDverification = checkin => {
    let content = [];
    if(checkin.verification && checkin.verification.stripe) {
        const stripe = checkin.verification.stripe;
        content = content.concat([
            {text: `Stripe Verification`, ...styles.regular, bold: true},
            {text: `Type: ${renderValue(stripe.type)}`, ...styles.regular},
            {text: `Status: ${renderValue(stripe.status)}`, ...styles.regular},
            {text: `Report: ${renderValue(stripe.report)}`, ...styles.regular},
        ])
    }

    if(checkin.verification && checkin.verification.smile) {
        const smileResult = checkin.verification.smile.result ? checkin.verification.smile.result : {};
        const smileActions = smileResult ? smileResult.Actions : {};
        
        content = content.concat([
            {text: `Smile Verification`, ...styles.regular, bold: true},
            {text: `Result: ${renderValue(smileResult.ResultText)}`, ...styles.regular},
        ]);
        for(let action in smileActions){
            content.push({
                text: `${action.replace(/_/g, ' ')}: ${smileActions[action]}`, ...styles.regular
            })
        }
    }

    if(checkin.verification && checkin.verification.upload) {
        const upload = checkin.verification.upload;

        content = content.concat([
            {text: `Uploaded ID`, ...styles.regular, bold: true},
            // upload.url ? {image: upload.url, width: 200, height: 150} : {},
            {text: `${renderValue(upload.url)}`, ...styles.regular},
            {text:  `Verified by: ${upload.verified_by && upload.verified_by.property ? upload.verified_by.property.name : 'Not Verified Yet'}`, ...styles.regular}
        ]);
    }

    return content;
}

const renderCreditCard = checkin => {
    let content = [];
    const creditCard = checkin.credit_card;
    if(creditCard && creditCard.stripe && creditCard.stripe.card) {
        const card = creditCard.stripe.card;
        content = content.concat([
            {text: `Brand: ${renderValue(card.brand)}`, ...styles.regular},
            {text: `Exp Month: ${renderValue(card.exp_month)}`,  ...styles.regular},
            {text: `Exp year: ${renderValue(card.exp_year)}`,  ...styles.regular},
            {text: `Last4: ${renderValue(card.last4)}`,  ...styles.regular},
            {text: `Submitted via: Stripe`,  ...styles.regular},
        ])
    }

    if(creditCard && creditCard.paystack) {
        const card = creditCard.paystack;
        content = content.concat([
            {text: `Brand: ${renderValue(card.card_type)}`,  ...styles.regular},
            {text: `Exp Month: ${renderValue(card.exp_month)}`, ...styles.regular},
            {text: `Exp year: ${renderValue(card.exp_year)}`, ...styles.regular},
            {text: `Last4: ${renderValue(card.last4)}`, ...styles.regular},
            {text: `Submitted via: Paystack`,  ...styles.regular},
        ])
    }
    return content;
}

const renderSignature = (checkin) => {
    return {
        image: checkin.signature,
        width: 200, height: 60
    }
}

const styles = {
    sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: 10
    },
    header1: {
        alignment: 'center',
        fontSize: 25,
        bold: true,
        margin: 5
    },
    header2: {
        fontSize: 20,
        bold: true,
        margin: 5
    },
    header3: {
        fontSize: 16,
        bold: true,
        margin: 5
    },
    subheader: {
        fontSize: 8,
        bold: true,
        margin: 5
    },
    regular: {
        fontSize: 10,
        margin: 3,
    },
    quote: {
        italics: true,
        margin: 5
    },
    small: {
        fontSize: 8,
        margin: 3
    },

    label: {
        fontSize: 10,
        bold: false,
        margin: 5
    },

    value: {
        fontSize: 10,
        bold: true,
        margin: 5,
    },

    verticalSpace: {
        margin: 12
    }

}

export const summary = (reservation) => {

    let { property } = reservation;
    const balance = reservation.balance ? `${reservation.currency} ${reservation.balance}` : null;
    const channel = reservation.booking_channel ? (reservation.booking_channel.label === 'Other' ? reservation.booking_channel.value : reservation.booking_channel.label) : null;
    return [
        {text: `Guest Registration`, alignment: 'center', ...styles.header2},
        {text: property.name, alignment: 'center', ...styles.header3},
        {text: `Reservation Details`, ...styles.sectionHeader},
        {text: `Booking Ref: ${renderValue(reservation.booking_reference)}`, ...styles.regular},

        {text: '', ...styles.verticalSpace},
       
        {
            alignment: 'justify',
            columns: [
                {
                    stack: [
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Guest Name', ...styles.label},
                                {text: reservation.name, ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Email', ...styles.label},
                                {text: renderValue(reservation.email), ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Phone', ...styles.label},
                                {text: renderValue(reservation.phone), ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Booking Channel', ...styles.label},
                                {text: renderValue(channel), ...styles.value},
                            ]
                        },
                    ]
                },
                {
                    stack: [
                        {
                            columns: [
                                {text: 'Checkin Date', ...styles.label},
                                {text: moment(reservation.checkin_date).format(dateFormat), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Checkout Date', ...styles.label},
                                {text: moment(reservation.checkout_date).format(dateFormat), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Room/Listing', ...styles.label},
                                {text: renderValue(reservation.room), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Balance', ...styles.label},
                                {text: renderValue(balance), ...styles.value},
                            ]
                        },

                    ]
                },
            ]
        },

        {text: '', ...styles.verticalSpace},

        {
            alignment: 'justify',
            columns: [
                {
                   stack: [
                       {text: `Charges`, ...styles.sectionHeader},
                        renderCharges(reservation)
                   ]
                },
                {
                    stack: [
                        {text: `Agreements`, ...styles.sectionHeader},
                        renderAgreements(reservation)
                    ]
                },
                
            ]
        },

        {text: '', ...styles.verticalSpace},

        {
            columns: [
                {
                    stack: [
                        {text: `Questions`, ...styles.sectionHeader},
                        renderQuestions(reservation)
                    ]
                },
                {
                    stack: [
                        {text: `Others`, ...styles.sectionHeader},
                        {text: `Requires ID  Verification: ${reservation.require_id_verification ? 'YES' : 'NO'}`, ...styles.regular},
                        {text: `Requires Debit/Credit Card: ${reservation.require_credit_card ? 'YES' : 'NO'}`,  ...styles.regular},
                        {text: `Allows Additional Guest: ${reservation.allow_additional_guest ? 'YES' : 'NO'}`, ...styles.regular},        
                    ]
                }
            ]
        },
    ]
}

export const contract = (reservation, checkin = null) => {
    
    let { property } = reservation;
    const balance = reservation.balance ? `${reservation.currency} ${reservation.balance}` : null;
    const channel = reservation.booking_channel ? (reservation.booking_channel.label === 'Other' ? reservation.booking_channel.value : reservation.booking_channel.label) : null;
    return [
        {text: `Guest Registration`, alignment: 'center', ...styles.header2},
        {text: property.name, alignment: 'center', ...styles.header3},
        {text: "Checkin Contract", alignment: 'center', ...styles.header3},
        {text: `Reservation Details`, ...styles.sectionHeader},
        {text: `Booking Ref: ${renderValue(reservation.booking_reference)}`, ...styles.regular},

        {text: '', ...styles.verticalSpace},
       
        {
            alignment: 'justify',
            columns: [
                {
                    stack: [
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Guest Name', ...styles.label},
                                {text: reservation.name, ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Email', ...styles.label},
                                {text: renderValue(reservation.email), ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Phone', ...styles.label},
                                {text: renderValue(reservation.phone), ...styles.value},
                            ]
                        },
                        {
                            alignment: 'left',
                            columns: [
                                {text: 'Booking Channel', ...styles.label},
                                {text: renderValue(channel), ...styles.value},
                            ]
                        },
                    ]
                },
                {
                    stack: [
                        {
                            columns: [
                                {text: 'Checkin Date', ...styles.label},
                                {text: moment(reservation.checkin_date).format(dateFormat), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Checkout Date', ...styles.label},
                                {text: moment(reservation.checkout_date).format(dateFormat), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Room/Listing', ...styles.label},
                                {text: renderValue(reservation.room), ...styles.value},
                            ]
                        },
                        {
                            columns: [
                                {text: 'Balance', ...styles.label},
                                {text: renderValue(balance), ...styles.value},
                            ]
                        },

                    ]
                },
            ]
        },

        {text: '', ...styles.verticalSpace},

        {
            alignment: 'justify',
            columns: [
                {
                   stack: [
                       {text: `Charges`, ...styles.sectionHeader},
                        renderCharges(reservation, checkin)
                   ]
                },
                {
                    stack: [
                        {text: `Agreements`, ...styles.sectionHeader},
                        renderAgreements(reservation, checkin)
                    ]
                },
                
            ]
        },

        {text: '', ...styles.verticalSpace},

        {
            columns: [
                {
                    stack: [
                        {text: `Questions`, ...styles.sectionHeader},
                        renderQuestions(reservation, checkin)
                    ]
                },
                {
                    stack: [
                        {text: `Others`, ...styles.sectionHeader},
                        {text: `Requires ID  Verification: ${reservation.require_id_verification ? 'YES' : 'NO'}`, ...styles.regular},
                        {text: `Requires Debit/Credit Card: ${reservation.require_credit_card ? 'YES' : 'NO'}`,  ...styles.regular},
                        {text: `Allows Additional Guest: ${reservation.allow_additional_guest ? 'YES' : 'NO'}`, ...styles.regular},        
                    ]
                }
            ]
        },

        {
            columns: [
                {
                    stack: [
                        {text: `ID Verification`, ...styles.sectionHeader},
                        renderIDverification(checkin)
                    ]
                },

                {
                    stack: [
                        {text: `Credit card`, ...styles.sectionHeader},
                        renderCreditCard(checkin)
                    ]
                },

            ]
        },
        {
            alignment: "center",
            stack: [
                {text: `Instructions`, ...styles.sectionHeader},
                {text: renderValue(reservation.instruction), ...styles.regular}
            ]
        },
        {
            alignment: "center",
            stack: [
                {text: `Signature`, ...styles.sectionHeader},
                renderSignature(checkin)
            ]
        }
    ]
}
