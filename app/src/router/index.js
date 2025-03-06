import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CountDown from '../views/CountDown.vue';
import CountUp from '../views/CountUp.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/countdown', component: CountDown },
  { path: '/countup', component: CountUp }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
