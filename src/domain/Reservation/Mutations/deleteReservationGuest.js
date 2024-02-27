import gql from 'graphql-tag';

export default gql`
    mutation deleteReservationGuest ($reservation_id: ID!, $guest_id: ID!) {
        deleteReservationGuest(reservation_id: $reservation_id, guest_id: $guest_id) 
    }`;