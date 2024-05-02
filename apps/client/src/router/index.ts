import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageAccueil from '../views/PageAccueil.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import Feed from '../components/common/feed.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/homepage',
      name: 'homepage',
      component : PageAccueil
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView
    },{
      path: '/feed',
      name: 'feed',
      component: Feed
    }
  ]
})

export default router
