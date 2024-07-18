import Vue from 'vue';
import Vuetify from 'vuetify/lib';

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
