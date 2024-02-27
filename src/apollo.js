import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { InMemoryCache } from "apollo-cache-inmemory";
import store from './store'
import config from "@/config";

export default async (uri, onNetworkError = () => {}, onGraphQlError = () => {}) => {
    const httpLink = new HttpLink({
    uri,
    fetch,
    headers: {
        'LC-CLIENT-TOKEN': `Bearer ${config.apollo.client_key}`,
        'LC-USER-TOKEN': `Bearer ${store.getters.auth.token}`
      }
    });
  
    // Error Handling
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path, extensions }) => {
              console.log(
                  `[GraphQL error] ====> `, { message, locations, path, extensions }
              );
            onGraphQlError({ message, locations, path, extensions })
          }
        )
    if (networkError) {
        console.log("[Network error]--->", networkError.result)
        onNetworkError(networkError)
    }
  })

  const client = new ApolloClient({
      link: errorLink.concat(httpLink),
      cache: new InMemoryCache({
        addTypename: false
      })
    });

  return { client }
}