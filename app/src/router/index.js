import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CountDown from '../views/CountDown.vue';
import CountUp from '../views/CountUp.vue';
import About from '../views/About.vue';
import Player from '../views/Player.vue';
import Comments from '../views/Comments.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/birthday', component: CountDown },
  { path: '/timeline', component: CountUp },
  { path: '/about', component: About },
  { path: '/player', component: Player },
  { path: '/comments', component: Comments },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
