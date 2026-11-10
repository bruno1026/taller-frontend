<script setup>
import Navbar from './components/Navbar.vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const route = useRoute()
const router = useRouter()

const mostrarNavbar = computed(() => route.meta.showNavbar ?? false)
const mostrarFooter = computed(() => route.meta.showFooter ?? false)

const lastActivity = ref(Date.now())
const IDLE_LIMIT_MS = 10 * 60 * 1000
let idleInterval

const resetActivity = () => {
  lastActivity.value = Date.now()
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  const events = ['mousemove', 'keydown', 'click', 'scroll']
  events.forEach(evt => window.addEventListener(evt, resetActivity))

  idleInterval = setInterval(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    if (Date.now() - lastActivity.value > IDLE_LIMIT_MS) {
      logout()
    }
  }, 30 * 1000)
})

onBeforeUnmount(() => {
  const events = ['mousemove', 'keydown', 'click', 'scroll']
  events.forEach(evt => window.removeEventListener(evt, resetActivity))
  if (idleInterval) clearInterval(idleInterval)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col w-full max-w-full overflow-x-clip">
    <Navbar v-if="mostrarNavbar" />
    <main class="flex-1 w-full max-w-full">
      <RouterView />
    </main>
    <footer v-if="mostrarFooter" class="bg-black text-white text-center py-8 text-sm">
      © {{ new Date().getFullYear() }} Servicio Especializado de Renault — Todos los derechos reservados.
    </footer>
  </div>
</template>
