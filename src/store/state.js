
const state = {
    app_ready: false,
    app_process: '',
    auth: {
        token: null,
        profile: null,
    },
    mode: 'application',
    auth_required: false,
    current_user: {
        auth: null,
        profile: null,
        guest_info: null,
        reservations: [],
    },
    current_property: null,
    snackbar: {
        status: false,
        text: '', 
        color: 'primary', 
    },
    app_layout: 'full',
    is_mobile: true,
    system: {},
    current_page: {},
    checkin_session: {
        reservation: null,
        session: null,
        memory: {}
    },
}
export default state;