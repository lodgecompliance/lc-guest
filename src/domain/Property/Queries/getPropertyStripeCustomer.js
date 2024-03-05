import gql from 'graphql-tag';

export default gql`
    query getBusinessStripeCustomer($business_id: ID!, $integration_id: ID!, $user_id: ID!){
        getBusinessStripeCustomer(business_id: $business_id, integration_id: $integration_id, user_id: $user_id,){
            customer {
                id
                object
                address {
                    city
                    country
                    line1
                    line2
                    postal_code
                    state
                }
                balance
                created
                currency
                description
                email
                livemode
                metadata {
                    property_id
                    user_id
                }
                name
                phone
            }
            sources {
                has_more
                data {
                    id
                    name
                    brand
                    exp_month
                    exp_year
                    last4
                }
            }
            payment_methods {
                has_more
                data {
                    id
                    type
                    card {
                        brand
                        exp_month
                        exp_year
                        last4
                    }
                }
            }
            stripe_account
        }
    }`;