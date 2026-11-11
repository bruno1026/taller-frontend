<script setup>
import Sidebar from './components/Sidebar.vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()

const mostrarNavbar = computed(() => route.meta.showNavbar ?? false)
const mostrarFooter = computed(() => route.meta.showFooter ?? false)

const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')

watch(isSidebarCollapsed, (val) => {
  localStorage.setItem('sidebar_collapsed', val ? 'true' : 'false')
})

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
  <div class="min-h-screen bg-zinc-950 flex flex-col w-full max-w-full overflow-x-clip text-zinc-100 selection:bg-yellow-500 selection:text-black">
    <!-- Barra Lateral Moderna -->
    <Sidebar
      v-if="mostrarNavbar"
      v-model:collapsed="isSidebarCollapsed"
    />

    <!-- Área de Contenido Principal desplazada según el estado del menú lateral -->
    <div
      :class="[
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
        mostrarNavbar ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''
      ]"
    >
      <main class="flex-1 w-full max-w-full">
        <RouterView />
      </main>

      <footer v-if="mostrarFooter" class="bg-zinc-950/80 backdrop-blur-md border-t border-white/5 text-zinc-500 text-center py-6 text-xs font-medium">
        &copy; {{ new Date().getFullYear() }} Servicio Mecánico Especializado Renault &mdash; Todos los derechos reservados.
      </footer>
    </div>
  </div>
</template>
