import gql from 'graphql-tag';

export default gql`
    query getAuthUser {
        getAuthUser {
            id
            email
            phone
            first_name
            last_name
            full_name
            image
            status
            account_type
            id_verification {
                first_name
                last_name
                country
                id_type
                id_number
                id_image
                timestamp {
                    created_at
                    updated_at
                }
             }    
        }
    }`;