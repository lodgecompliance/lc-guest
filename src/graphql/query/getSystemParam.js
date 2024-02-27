import gql from 'graphql-tag';

export default gql`
    query getSystemParams {
        getSystemParams {
            key
            value
        }
    }
`;