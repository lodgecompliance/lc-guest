import gql from 'graphql-tag';

export default gql`
    query getAuth{
        getAuth {
            authentication {
                uid
                name
                email
                is_admin
                sign_in_provider
                admin {
                    uid
                    level
                    active
                }
            }
        }
    }`;