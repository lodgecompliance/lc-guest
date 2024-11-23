import gql from 'graphql-tag';

export default gql`
    query getReservation($id: ID!){
        getReservation(id: $id){
            id
            user_id
            property_id
            name
            phone
            email
            balance
            currency
            room
            booking_reference
            booking_channel {
                id
                label
            }
            active
            status
            checkedin
            already_checkedin
            checkedin_at
            approved
            approved_at
            approved_by {
                id
                email
                first_name
                last_name
                image
            }
            checkedout
            checkedout_at
            checkedout_by {
                id
                email
                first_name
                last_name
                image
            }
            cancelled
            cancelled_at
            cancelled_by {
                id
                email
                first_name
                last_name
                image
            }
            checkin_date
            checkout_date
            instruction
            checkin_url
            guest_checkin_url
            property_id
            property{
                id
                business_id
                name
                rules
                term_url
                email
                phone
                image
                cover_image
                address  
                currency   
            }
            user {
                id
                email
                first_name
                last_name
                image
            }
            guests{
                id
                name
                type
                user_id
                can_verify_id
                checkedin_at
                user {
                    id
                    email
                    first_name
                    last_name
                    full_name
                    image
                }
                info {
                    age
                    gender
                    phone
                    email
                    address
                }
            }
            charges {
                id
                title
                amount
                description
                type
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

            instructions {
                id
                title
                body
            }
            agreements {
                id
                agreement
                link
                text
            }

            # Questions start
            questions {
                id
                question
                response_type
                required
                options {
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
                        }
                    }
                }

            }
            # Questions end
            
            require_id_verification
            require_credit_card
            allow_additional_guest
            auto_checkin_approval
            setting {
                payment_gateway
                checkin_approval_rules
                max_period_for_charge_authorization
            }
            send_checkin_mail
            checkin_mail
            host_actions {
                key
                value
            }
            created_by {
                id
                email
                first_name
                last_name
                image
            }
            timestamp {
                created_at
                updated_at
            }
        }
    }`;