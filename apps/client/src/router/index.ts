import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageAccueil from '../views/PageAccueil.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import Feed from '../components/common/feed.vue'
import { useTokenStore } from '@/stores/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/homepage',
      name: 'homepage',
      component : PageAccueil,
      meta: {
        isPrivate: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: {
        isPrivate: true,
      },
    },{
      path: '/feed',
      name: 'feed',
      component: Feed,
      meta: {
        isPrivate: true,
      },
    },{
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    }
  ]
});

router.beforeEach((to, from) => {
  const tokenStore = useTokenStore();

  if (to.meta.isPrivate && !tokenStore.isLoggedIn()) {
    return { name: 'home' };
  } else if (to.meta.isPublic && tokenStore.isLoggedIn()) {
    return { name: 'homepage' };
  }
})

export default router
