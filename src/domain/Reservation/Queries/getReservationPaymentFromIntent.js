import gql from 'graphql-tag';
export default gql`
    query getReservationPaymentFromIntent($property_id: ID!, $intent_id: ID!){
      getReservationPaymentFromIntent(property_id: $property_id, intent_id: $intent_id) {
        id
        description
        currency
        amount
        status
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
            refundable
        }
        captured
        refunded
        amount_captured
        amount_refunded
        receipt_url
        net_captured
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
}`
