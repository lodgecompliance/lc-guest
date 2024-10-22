import gql from 'graphql-tag';

export default gql`
mutation refreshAuthToken($refresh_token: String!){
  refreshAuthToken(refresh_token: $refresh_token) {
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