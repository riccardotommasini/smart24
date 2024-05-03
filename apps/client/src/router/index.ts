import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import PageAccueil from '../views/PageAccueil.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import Feed from '../components/common/feed.vue'
import { useTokenStore } from '@/stores/auth'
import UserProfileView from '@/views/UserProfileView.vue'

const ROUTES = {
  login: 'login',
  homepage: 'homepage',
  register: 'register',
  settings: 'settings',
  feed: 'feed',
  profile: 'profile',
};


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: ROUTES.login,
      component: LoginView,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/homepage',
      name: ROUTES.homepage,
      component : PageAccueil,
      meta: {
        isPrivate: true,
      },
    },
    {
      path: '/register',
      name: ROUTES.register,
      component: RegisterView,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/settings',
      name: ROUTES.settings,
      component: UserSettingsView,
      meta: {
        isPrivate: true,
      },
    },{
      path: '/feed',
      name: ROUTES.feed,
      component: Feed,
      meta: {
        isPrivate: true,
      },
    },{
      path: '/profile/:profileId',
      name: ROUTES.profile,
      component: UserProfileView,
      props: true,
      meta: {
        isPrivate: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: ROUTES.login },

    }
  ]
});

router.beforeEach((to) => {
  const tokenStore = useTokenStore();

  if (to.meta.isPrivate && !tokenStore.isLoggedIn()) {
    return { name: ROUTES.login };
  } else if (to.meta.isPublic && tokenStore.isLoggedIn()) {
    return { name: ROUTES.homepage };
  }
})

export default router
