const getters = {
    auth: state => state.auth,
    auth_required: state => state.auth_required,
    mode: state => state.mode,
    app_ready: state => state.app_ready,
    app_process: state => state.app_process,
    authenticated: state => !!state.current_user?.auth?.uid,
    profile_loaded: state =>  !!Object.keys(state.current_user.profile || {}).length,
    current_user: state => state.current_user,
    current_property: state => state.current_property,
    current_page: state => state.current_page,
    reservations: state => state.current_user?.reservations || [],
    system: state => state.system,
    snackbar: state => state.snackbar,
    app_layout: state => state.app_layout,
    is_mobile: state => state.is_mobile,
    checkin_session: state => state.checkin_session,
    checkin_session_checkin: state => state.checkin_session.checkin,
}

export default getters