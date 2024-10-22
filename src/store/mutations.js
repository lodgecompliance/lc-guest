
const mutations = {
    SET_APP_STATE: (state, ready) => {
        state.app_ready = ready
    },

    SET_APP_PROCESS: (state, process) => {
        state.app_process = process
    },

    SET_USER_AUTH: (state, auth) => {
        state.current_user.auth = auth
    },

    SET_USER_PROFILE: (state, profile) => {
        state.current_user.profile = profile
    },

    SET_AUTH: (state, auth) => {
        state.auth = auth
        window.localStorage.setItem('authorization', JSON.stringify(state.auth.token))
    },

    SET_AUTH_PARAM: (state, { key, value }) => {
        state.auth_params[key] = value
    },

    SET_AUTH_REQUIRED: (state, required) => {
        state.auth_required = required
    },

    SET_CURRENT_PROPERTY: (state, property) => {
        state.current_property = property
    },

    SET_GUEST_INFO: (state, info) => {
        state.current_user.guest_info = info
    },

    SET_RESERVATIONS: (state, reservations = []) => {
        state.current_user.reservations = reservations
    },

    UNSET_CURRENT_USER: (state) => {
        state.current_user = {
            auth: null,
            profile: null,
            reservations: [],
        }
    },

    SNACKBAR(state, settings){
        state.snackbar = settings
    },

    SET_APP_LAYOUT(state, layout) {
        state.app_layout = layout
    },

    SET_MOBILE(state, is_mobile) {
        state.is_mobile = is_mobile;
    },

    SET_CHECKIN_SESSION_RESERVATION(state, reservation) {
        state.checkin_session.reservation = reservation
    },

    SET_CHECKIN_SESSION(state, session) {
        state.checkin_session.session = session
    },

    SET_CHECKIN_SESSION_MEMORY(state, { key, value }) {
        state.checkin_session.memory[key] = value
    },

    SET_SYSTEM_PARAMS (state, params) {
        state.system = params || {}
    },

    SET_CURRENT_PAGE(state, page) {
        state.current_page = { ...state.current_page, ...page }
    },

    SET_MODE(state, mode) {
        state.mode = mode
    }

}

export default mutations