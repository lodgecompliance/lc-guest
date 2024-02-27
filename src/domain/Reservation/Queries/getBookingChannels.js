import gql from 'graphql-tag';

export default gql`
query getBookingChannels {
    getBookingChannels {
        id
        label
    }
}
`
