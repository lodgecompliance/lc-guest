import gql from 'graphql-tag';

export default gql`
    mutation createReservationGuest ($reservation_id: ID!, $data: ReservationGuestInput!) {
        createReservationGuest(reservation_id: $reservation_id, data: $data) {
            id
            name
            gender
            type
            user_id
            can_verify_id
        }
    }`;