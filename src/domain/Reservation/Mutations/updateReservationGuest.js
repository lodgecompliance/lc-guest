import gql from 'graphql-tag';

export default gql`
    mutation updateReservationGuest ($reservation_id: ID!, $guest_id: ID!, $data: ReservationGuestInput!) {
        updateReservationGuest(reservation_id: $reservation_id, guest_id: $guest_id, data: $data) {
            id
            name
            gender
            type
            user_id
            can_verify_id
        }
    }`;