import gql from 'graphql-tag';

export default gql`
    mutation finalizeReservationCheckin($reservation_id: ID!, $session_id: ID!, $signature: String!) {
        finalizeReservationCheckin(reservation_id: $reservation_id, session_id: $session_id, signature: $signature) {
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
            checkedin
            already_checkedin
            checkedin_at
            approved
            approved_at
            checkin_date
            checkout_date
            instruction
            checkin_url
            property_id
            status
            property{
                id
                name
                address
                image
            }
        }
    }`;