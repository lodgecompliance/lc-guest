import _apollo from '@/apollo';
import helper from '@/helper';
import GET_AUTH from '../domain/User/Queries/getAuth';
import GET_ACCOUNT_AUTH_USER from '../domain/User/Queries/getAuthUserAccount';
import GET_GR_AUTH_USER from '../domain/User/Queries/getAuthUserGrProfile';
import GET_SYSTEM_PARAMS from '../graphql/query/getSystemParam'
import REFRESH_AUTH_USER_TOKEN from '../domain/User/Queries/refreshAuthUserToken';
import config from "@/config";
import moment from "moment";

const actions = {

    getSystemParams({ commit, dispatch }) {
        return new Promise((resolve, reject) => {
            dispatch('query', {
                query: GET_SYSTEM_PARAMS
            }).then(response => {
                const params = helper.convertMetaKeyValueToObj(response.data.getSystemParams || []);
                commit("SET_SYSTEM_PARAMS", params)
                resolve(params)
            }).catch(e => reject(e))
        })
    },

    getAuthUser({ commit, dispatch, getters }) {
        return new Promise((resolve, reject) => {
            dispatch('query', {
                domain: config.apollo.auth,
                query: GET_AUTH
            }).then(response => {
                const auth = response.data.getAuth?.authentication
                commit('SET_USER_AUTH', auth)
                resolve(auth)
            }).catch(e => reject(e));
        })
    },

    getAuthAccountProfile({ commit, dispatch, getters }) {
        return new Promise((res, rej) => {
            dispatch('query', {
                domain: config.apollo.account,
                query: GET_ACCOUNT_AUTH_USER,
            }).then(response => {
                const account = response.data.getAuthUser;
                commit('SET_USER_PROFILE', account );
                res(account);
            }).catch(e => rej(e))
        })
    },

    getAuthGrProfile({ commit, dispatch, getters }) {
        return new Promise((res, rej) => {
            dispatch('query', {
                domain: config.apollo.gr,
                query: GET_GR_AUTH_USER
            }).then(response => {
                const user = response.data.getAuthUser;
                commit('SET_GUEST_INFO', user?.guest_info || {})
                commit('SET_RESERVATIONS', user?.reservations || [] );
                res(user)
            }).catch(e => rej(e))
        })
    },


    refreshAuthToken({ commit, dispatch, getters }) {
        return dispatch('query', {
            domain: config.apollo.auth,
            mutation: REFRESH_AUTH_USER_TOKEN,
            variables: {
                origin: config.app.url,
                refresh_token: getters.auth.token?.refresh_token
            }
        }).then(response => {
            commit('SET_AUTH', {
                token: response?.data?.refreshAuthToken,
                profile: getters.auth.profile
            })
        })
    },

    getAuthToken( { dispatch, getters } ) {
        if (!getters.auth?.token) return Promise.resolve(null)
        if(moment(getters.auth.token.expirationTime).isSameOrBefore(moment())) {
            return dispatch('refreshAuthToken')
                .then(() => dispatch('getAuthToken'))
                .catch(() => dispatch('signout'))
        } else {
            return Promise.resolve(getters.auth.token?.token)
        }
    },

    query({commit, dispatch}, { domain = config.apollo.gr,  query, variables, trial = 1 }){
        return _apollo(domain,(e) => {
                console.log('Network Error-->', e);
            }, (e) => {
                console.log('GraphQL Error-->', e);
            }
        )
            .then(apollo =>  apollo.client.query({ query, variables }))
    },

    mutate({commit, dispatch}, { domain = config.apollo.gr, mutation, variables}){
        return _apollo(domain,(e) => {
                console.log('Network Error-->', e);
            }, (e) => {
                console.log('GraphQL Error-->', e);
            }
        ).then(apollo => apollo.client.mutate({mutation, variables }))
    },

    syncAuthUser({ dispatch }) {
        return dispatch('getAuthUser')
            .then(() => dispatch('getAuthAccountProfile'))
            .then(() => dispatch('getAuthGrProfile'))
    },

    signout({dispatch, commit}){
       return new Promise((resolve) => {
           dispatch('postToAuth', { type: 'signout' })
           dispatch('signedOut')
           resolve()
       })
    },

    signedOut({ commit }){
        commit('UNSET_CURRENT_USER');
        commit('SET_AUTH', { token: null, profile: null });
        commit('SET_MODE', null)
    },

    postToAuth({ commit }, data) {
        let iframeEl = document.getElementById("authFrame");
        if(iframeEl) {
            iframeEl.contentWindow.postMessage(data, config.app.authDomain);
        }
    }
}

export default actions