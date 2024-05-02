import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import PageAccueil from '../views/PageAccueil.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import Feed from '../components/common/feed.vue'
import UserProfileView from '@/views/UserProfileView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
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
      path: '/settings',
      name: 'settings',
      component: UserSettingsView
    },{
      path: '/feed',
      name: 'feed',
      component: Feed
    },{
      path: '/profile/:profileId',
      name:'profile',
      component: UserProfileView,
      props: true
    }
  ]
})

export default router
