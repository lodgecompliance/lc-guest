import gql from 'graphql-tag';

export default gql`

    mutation createBusinessStripeCustomer($business_id: ID!, $integration_id: ID!, $user_id: ID!, $name: String, $source: ID, $email: String, $phone: String, $description: String ){
        createBusinessStripeCustomer(business_id: $business_id, integration_id: $integration_id, user_id: $user_id, name: $name, source: $source, email: $email, phone: $phone, description: $description){
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
                    key
                    value
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
    }
`