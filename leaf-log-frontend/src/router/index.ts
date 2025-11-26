import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PlantList from '../views/PlantList.vue'
import PlantDetail from '../views/PlantDetail.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import BoardListView from '../views/BoardListView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import PostFormView from '../views/PostFormView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/board',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/board',
      name: 'board',
      component: BoardListView,
    },
    {
      path: '/board/new',
      name: 'post-new',
      component: PostFormView,
      meta: { requiresAuth: true },
    },
    {
      path: '/board/:id',
      name: 'post-detail',
      component: PostDetailView,
    },
    {
      path: '/plants',
      name: 'plants',
      component: PlantList,
      meta: { requiresAuth: true },
    },
    {
      path: '/plant/:id',
      name: 'plant-detail',
      component: PlantDetail,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initializeAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
