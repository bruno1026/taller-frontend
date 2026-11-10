<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_URL
const form = ref({
  correo: '',
  contraseña: ''
})
const mostrarPassword = ref(false)
const recordarUsuario = ref(true)
const mensaje = ref('')
const cargando = ref(false)
const isFormVisible = ref(false)

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true
})

onMounted(() => {
  const savedEmail = localStorage.getItem('savedEmail')
  if (savedEmail) {
    form.value.correo = savedEmail
  }
  setTimeout(() => {
    isFormVisible.value = true
  }, 100)
})

const login = async () => {
  try {
    cargando.value = true
    mensaje.value = ''

    if (recordarUsuario.value && form.value.correo) {
      localStorage.setItem('savedEmail', form.value.correo)
    } else {
      localStorage.removeItem('savedEmail')
    }

    const data = form.value
    const res = await axios.post(`${API}/auth/login`, data)

    localStorage.setItem('authToken', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.usuario))

    await toast.fire({ icon: 'success', title: 'Bienvenido de nuevo' })
    router.push('/seleccion-taller')
  } catch (error) {
    mensaje.value = error.response?.data?.msg || 'Credenciales incorrectas o falla de conexión al servidor'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="bg-zinc-950 text-zinc-100 min-h-screen relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <!-- Fondo tecnológico avanzado: Partículas doradas, blueprint, malla y paneles -->
    <TechBackground />

    <!-- Header Glassmorphism con botón volver -->
    <header class="w-full px-4 sm:px-8 xl:px-12 h-16 sm:h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-zinc-950/70 sticky top-0 z-40">
      <div class="flex items-center min-w-0">
        <a @click="router.push('/')" class="group flex items-center gap-3 cursor-pointer select-none" aria-label="Inicio">
          <div class="size-9 sm:size-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
              <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
            </svg>
          </div>
          <div class="flex flex-col text-left min-w-0">
            <span class="text-white font-extrabold tracking-tight text-xs sm:text-base leading-tight truncate">
              Servicio Mecánico<span class="hidden sm:inline"> Especializado</span>
            </span>
            <span class="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide truncate">Portal de Gestión</span>
          </div>
        </a>
      </div>

      <div>
        <button
          @click="router.push('/')"
          class="h-9 sm:h-10 px-3.5 sm:px-4 inline-flex items-center gap-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.97] transition-all cursor-pointer leading-none"
        >
          <ArrowLeftIcon class="size-4 text-yellow-400 shrink-0" />
          <span>Volver al Inicio</span>
        </button>
      </div>
    </header>

    <!-- Contenedor Central del Login -->
    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div
        class="w-full max-w-md mx-auto transition-all duration-500 ease-out"
        :class="{
          'opacity-100 translate-y-0 scale-100': isFormVisible,
          'opacity-0 translate-y-6 scale-[0.98]': !isFormVisible
        }"
      >
        <!-- Tarjeta de Login Glassmorphism -->
        <div class="relative rounded-3xl p-7 sm:p-9 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl ring-1 ring-yellow-500/10 overflow-hidden">
          <!-- Borde de acento luminoso superior -->
          <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>

          <!-- Cabecera de la Tarjeta -->
          <div class="text-center mb-7">
            <div class="mx-auto size-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/25 mb-4 group-hover:scale-105 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-7 fill-black">
                <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
              </svg>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[11px] font-bold tracking-wider uppercase mb-2">
              <ShieldCheckIcon class="size-3.5" />
              Acceso Exclusivo Personal
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Iniciar Sesión
            </h1>
            <p class="mt-1.5 text-xs sm:text-sm text-zinc-400">
              Sistema de gestión interna únicamente para personal y técnicos autorizados
            </p>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="login" class="space-y-5">
            <!-- Campo Correo -->
            <div>
              <label for="correo" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                Correo electrónico
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <EnvelopeIcon class="size-5" />
                </div>
                <input
                  id="correo"
                  v-model="form.correo"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="usuario@taller.com"
                  class="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                />
              </div>
            </div>

            <!-- Campo Contraseña -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="contraseña" class="block text-xs sm:text-sm font-semibold text-zinc-200">
                  Contraseña
                </label>
                <button
                  type="button"
                  @click="router.push('/recuperar-password')"
                  class="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <LockClosedIcon class="size-5" />
                </div>
                <input
                  id="contraseña"
                  v-model="form.contraseña"
                  :type="mostrarPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="block w-full h-12 pl-11 pr-11 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all font-mono"
                />
                <button
                  type="button"
                  @click="mostrarPassword = !mostrarPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                >
                  <EyeSlashIcon v-if="mostrarPassword" class="size-5" />
                  <EyeIcon v-else class="size-5" />
                </button>
              </div>
            </div>

            <!-- Opciones adicionales (Recordarme) -->
            <div class="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="recordarUsuario"
                  class="size-4 rounded bg-zinc-950 border-white/20 text-yellow-500 focus:ring-yellow-400/20 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
                <span>Recordar mi usuario</span>
              </label>
              <span class="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                <ShieldCheckIcon class="size-3.5" /> Conexión cifrada
              </span>
            </div>

            <!-- Botón de Envío -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="cargando"
                class="w-full h-12 rounded-xl bg-yellow-500 text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <template v-if="cargando">
                  <svg class="animate-spin size-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Validando acceso...</span>
                </template>
                <template v-else>
                  <span>Ingresar al Sistema</span>
                  <ArrowRightIcon class="size-4 text-black stroke-[2.5]" />
                </template>
              </button>
            </div>
          </form>

          <!-- Banner de Mensaje de Error / Estado -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div
              v-if="mensaje"
              class="mt-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm bg-rose-500/10 border-rose-500/30 text-rose-300"
            >
              <ExclamationCircleIcon class="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div class="flex-1 font-medium leading-relaxed">
                {{ mensaje }}
              </div>
            </div>
          </transition>

        </div>

        <!-- Indicador de seguridad inferior -->
        <div class="mt-6 text-center flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheckIcon class="size-4 text-zinc-400" />
          <span>Acceso privado restringido &bull; Exclusivo colaboradores del taller</span>
        </div>
      </div>
    </main>

    <!-- Footer Discreto -->
    <footer class="w-full py-4 text-center text-xs text-zinc-600 border-t border-white/5 bg-zinc-950/40">
      © {{ new Date().getFullYear() }} Taller Mecánico Especializado &bull; Todos los derechos reservados.
    </footer>
  </div>
</template>

<style scoped>
/* Elimina resaltado azul táctil en móviles */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
