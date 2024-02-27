import gql from 'graphql-tag';

export default gql`
    query getUserReservations($id: ID, $pagination: PaginationInput, $includes: [String]){
        getUserReservations(id: $id, pagination: $pagination, includes: $includes){
            data {
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
                checkedout
                checkedout_at
                cancelled
                cancelled_at
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
                require_id_verification 
                require_credit_card     
            }
        }
    }`;