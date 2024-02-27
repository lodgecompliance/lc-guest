import store from '@/store';
import config from "@/config";

const middleware = {
    auth: (to, from, next) => {
        if(store.getters.app_ready) {
            if(store.getters.auth.token && store.getters.auth.profile){
                next();
            }else{
                window.location.replace(`${config.app.authDomain}?referer=${config.app.url}${to.fullPath}`)
            }
        }
    },
    guest: (to, from, next) => {
        if(store.getters.app_ready) {
            if (!(store.getters.auth.token && store.getters.auth.profile)) next();
            else {
                next(to.query.redirect
                    ? { path: to.query.redirect }
                    : { name: 'home' }
                );
            }
        }
    }
};
 
export default middleware;