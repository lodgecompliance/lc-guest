import gql from 'graphql-tag';

export default gql`
    query getReservationPayments($id: ID!, $user_id: ID, $all_payments: Boolean){
        getReservationPayments(id: $id, user_id: $user_id, all_payments: $all_payments){
            stripe {
                id
                currency
                amount
                status
                metadata {
                    user_id
                    reservation_id
                    charge_id
                    property_id
                    refundable
                    base_multiplier {
                        unit
                        quantity
                    }
                    custom_multipliers {
                        unit
                        quantity
                    }
                }
                captured
                refunded
                amount_captured
                amount_refunded
                receipt_url
                net_captured
                description
                payment_intent
                payment_method
                source {
                    id
                    name
                    brand
                    exp_month
                    exp_year
                    last4
                    customer
                }
            }

            paystack {
                amount
                currency
                reference
                status
                metadata {
                    user_id
                    property_id
                }
                charges {
                    property_id
                    amount
                    currency
                    description
                    receipt_email
                    capture
                    metadata {
                        user_id
                        reservation_id
                        charge_id
                        property_id
                        base_multiplier {
                            unit
                            quantity
                        }
                        custom_multipliers {
                            unit
                            quantity
                        }
                    }
                }
                authorization {
                    authorization_code
                    card_type
                    last4
                    exp_month
                    exp_year
                    reusable
                    bank
                }
            }
           
        }
    }`;