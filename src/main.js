import Vue from 'vue'
import VueMeta from 'vue-meta'
import VueIntercom from 'vue-intercom'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import config from './config';
import filters from './plugins/filters';
import VueTelInputVuetify from 'vue-tel-input-vuetify/lib';
import moment from "moment";

//Global components
import ReservationQuestion from './domain/Reservation/Components/ReservationQuestion.vue';
Vue.component('reservation-question', ReservationQuestion);

Vue.config.productionTip = false
 
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
});

if(config.intercom.app_id) {
  Vue.use(VueIntercom, { appId: config.intercom.app_id });
}

Vue.use(VueTelInputVuetify,{
    vuetify
})

Vue.prototype.$eventHub = new Vue(); // Global event bus

Vue.mixin({
    methods: {
        url: (path) => `${config.app.url}${path}`,
        sortDataAsc: (data = [], sortBy) => {
            return data.sort((first, second) => first[sortBy] > second[sortBy] ? 1 : (first[sortBy] < second[sortBy] ? -1 : 0))
        },
        sortDataDesc: (data = [], sortBy) => {
            return data.sort((first, second) => first[sortBy] < second[sortBy] ? 1 : (first[sortBy] > second[sortBy] ? -1 : 0))
        },
        groupData: (data = [], groupBy, valueKey) => {
            const groupedData = {};
            data.forEach(datum => {
                if(groupedData[datum[groupBy]]) {
                    groupedData[datum[groupBy]] += valueKey ? datum[valueKey] : 1
                } else {
                    groupedData[datum[groupBy]] = 1
                }
            })
            return groupedData;
        },
        sumArray: ( data = [] ) => {
            return data.reduce((a,b) => a+b, 0)
        },
        momentFromDate(date) {
            return moment(date)
        },
        momentFromTimestamp(timestamp) {
            return moment.unix(timestamp);
        },
        convertObjectToMetaKeyValue(obj = {}) {
            const arr = [];
            for (let key in obj) {
                arr.push({ key, value: obj[key] })
            }
            return arr;
        },
        convertMetaKeyValueToObj(arr = []) {
            const obj = {};
            for (let meta of arr) {
                obj[meta.key] = meta.value;
            }
            return obj;
        },
    }
});

Vue.use(filters);

new Vue({
  router,
  store,
  vuetify,
  // apolloProvider: apollo.provider,
  render: h => h(App)
}).$mount('#app')
