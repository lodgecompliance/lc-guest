import gql from 'graphql-tag';

export default gql`
    mutation checkinReservationGuest($reservation_id: ID!, $guest_id: ID!, $info: ReservationGuestInfoInput, $signature: String!) {
        checkinReservationGuest(reservation_id: $reservation_id, guest_id: $guest_id, info: $info, signature: $signature) {
            id
            name
            gender
            type
            user_id
        }
    }`;