import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/TodoList.vue')
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../components/404NotFound.vue"),
    },
  ]
})

export default router
