import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import ReservationRoutes from '../domain/Reservation/routes';
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Recent Checkins',
      requiresAuth: true,
    },
  }
].concat(
   ReservationRoutes
);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
})

router.beforeEach((to, from, next) => {
  const currentUser = router.app.$store.getters.current_user;
  /**
   * TODO: Implement route middleware here
   */
  next();
})


export default router;
