// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TallerView from '../views/TallerView.vue'
import LoginView from '../views/LoginView.vue'
import SeleccionTallerView from '../views/SeleccionTallerView.vue'
import ProfileView from '../views/ProfileView.vue'
import HistorialView from '../views/HistorialView.vue'
import ArchivosView from '../views/ArchivosView.vue'
import UsersAdminView from '../views/UsersAdminView.vue'
import RecuperarPasswordView from '../views/RecuperarPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import ContactoView from '../views/ContactoView.vue'
import TelegramView from '../views/TelegramView.vue'

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      showNavbar: false,
      showFooter: false,
      requiresAuth: false
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        showNavbar: false,
        showFooter: false
        }
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: ContactoView,
      meta: {
        showNavbar: false,
        showFooter: false,
        requiresAuth: false
      }
    },
    {
      path: '/seleccion-taller',
      name: 'seleccion-taller',
      component: SeleccionTallerView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true
        }
    },
    {
      path: '/taller/:taller',
      name: 'taller',
      component: TallerView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true
        }

    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true
        }
    },
      {
      path: '/historial',
      name: 'historial',
      component: HistorialView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true,
        roles: ['superadmin', 'admin', 'tecnico', 'empleado']
      }
    },
    {
      path: '/archivos',
      name: 'archivos',
      component: ArchivosView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true,
        roles: ['superadmin', 'admin']
      }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsersAdminView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true,
        roles: ['superadmin']
      }
    },
    {
      path: '/telegram',
      name: 'telegram',
      component: TelegramView,
      meta: {
        showNavbar: true,
        showFooter: true,
        requiresAuth: true,
        roles: ['superadmin']
      }
    },
      {
        path: '/recuperar-password',
        name: 'recuperar-password',
        component: RecuperarPasswordView,
        meta: {
          showNavbar: false,
          showFooter: false,
          requiresAuth: false
        }
      },
      {
        path: '/reset-password/:token',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: {
          showNavbar: false,
          showFooter: false,
          requiresAuth: false
        }
      },
  ],
})

// 🔒 Guard de autenticación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')
  const requiresAuth = to.meta.requiresAuth

  // Si intenta ir a login o home teniendo sesión activa, redirigir a selección de taller
  if (token && (to.name === 'login' || to.name === 'home')) {
    return next('/seleccion-taller')
  }

  if (requiresAuth) {
    if (!token) {
      localStorage.removeItem('user')
      return next('/login')
    }

    const decoded = decodeToken(token)
    const expired = !decoded || (decoded.exp && decoded.exp * 1000 < Date.now())
    if (expired) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      return next('/login')
    }

    // Verificar rol si la ruta lo exige: superadmin tiene acceso universal
    if (to.meta.roles && decoded.rol !== 'superadmin' && !to.meta.roles.includes(decoded.rol)) {
      return next('/seleccion-taller')
    }
  }

  next()
})

export default router
