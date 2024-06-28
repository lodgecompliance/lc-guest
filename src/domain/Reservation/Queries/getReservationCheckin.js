import gql from 'graphql-tag';

export default gql`
    query getReservation($id: ID!){
        getReservation(id: $id){
            checkin {
              checkedin_at
              agreements {
                  id
                  agreement
                  link
              }
              questions {
                  id
                  question
                  response {
                      option
                      attachments {
                          agreements {
                              id
                              agreement
                              link
                          }
                          charges {
                              id
                              type
                              title
                              amount
                              description
                              enable
                              optional
                              currency
                              unit
                              multipliers {
                                  min
                                  max
                                  unit
                              }
                          }
                          questions {
                              id
                              question
                              response_type
                              required
                              options {
                                  option
                              }
                              response {
                                  option
                              }
                          }
                      }
                  }
              }
              credit_card {
                  stripe {
                      customer
                      card {
                          id
                          brand
                          customer
                          exp_month
                          exp_year
                          last4
                          name
                      }
                      payment_method {
                          id
                          type
                          card {
                              brand
                              exp_month
                              exp_year
                              last4
                          }
                      }
                  }
                  paystack {
                      card_type
                      authorization_code
                      exp_month
                      exp_year
                      last4
                      reusable
                  }
              }
              signature
               user{
                    id
                    email
                    phone
                    first_name
                    last_name
               }
               payments {
                    stripe {
                        id
                        currency
                        amount
                        status
                        metadata {
                            user_id
                            reservation_id
                            charge_id
                            property_id
                            refundable
                            base_multiplier {
                                unit
                                quantity
                            }
                            custom_multipliers {
                                unit
                                quantity
                            }
                        }
                        captured
                        refunded
                        amount_captured
                        amount_refunded
                        receipt_url
                        net_captured
                        description
                        payment_intent
                        payment_method
                        source {
                            id
                            name
                            brand
                            exp_month
                            exp_year
                            last4
                            customer
                        }
                    }
    
                    paystack {
                        amount
                        currency
                        reference
                        status
                        metadata {
                            user_id
                            property_id
                        }
                        charges {
                            property_id
                            amount
                            currency
                            description
                            receipt_email
                            capture
                            metadata {
                                user_id
                                reservation_id
                                charge_id
                                property_id
                                base_multiplier {
                                    unit
                                    quantity
                                }
                                custom_multipliers {
                                    unit
                                    quantity
                                }
                            }
                        }
                        authorization {
                            authorization_code
                            card_type
                            last4
                            exp_month
                            exp_year
                            reusable
                            bank
                        }
                    }
               }
            }
        }
    }`;