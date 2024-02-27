import gql from 'graphql-tag';

export default gql`
    query getGrProfile{
        getAuthUser{
            guest_info {
                gender
                phone
                address
                email
                age
            }
            reservations {
                id
                user_id
                name
                balance
                currency
                room
                booking_reference
                booking_channel {
                    id
                    label
                }
                status
                active
                checkedin
                already_checkedin
                checkedin_at
                approved
                approved_at
                checkin_date
                checkout_date
                cancelled
                cancelled_at
                checkedout
                checkedout_at
                instruction
                checkin_url
                property_id
                property{
                    id
                    name
                    address
                    image
                    cover_image
                }
            }
        }
    }`;