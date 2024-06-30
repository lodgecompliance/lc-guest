import gql from 'graphql-tag';

export default gql`
mutation refreshAuthToken($refresh_token: String!, $origin: String!){
  refreshAuthToken(refresh_token: $refresh_token, origin: $origin) {
    access_token 
    expires_in
    id_token 
    project_id
    refresh_token
    token_type
    user_id
    refresh_token
  }
}    
`;