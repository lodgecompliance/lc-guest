import Vue from 'vue';
import Vuetify from 'vuetify/lib';
// import '@mdi/font/css/materialdesignicons.css';


Vue.use(Vuetify, {
    iconfont: 'mdi',
});

export default new Vuetify({
    theme: {
        themes: {
            light: {
                secondary: "#EC6A28",
            }
        }
    }
});
