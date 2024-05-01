import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageAccueil from '../views/PageAccueil.vue'


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
      path: '/Register',
      name: 'register',
      component: RegisterView
    }
  ]
})

export default router
