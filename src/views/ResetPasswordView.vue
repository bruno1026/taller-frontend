<template>
  <div class="bg-black min-h-screen relative isolate overflow-hidden">
    <!-- Fondo decorativo -->
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div
        class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-yellow-400 to-yellow-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <!-- Contenido Principal -->
    <div class="relative flex min-h-screen items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
      <div
        class="w-full max-w-md mx-auto transition-all duration-1000 ease-out"
        :class="{
          'opacity-100 translate-y-0': isVisible,
          'opacity-0 translate-y-10': !isVisible
        }"
      >
        <div class="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-500/20 p-8 sm:p-10">

          <!-- Icono y Título -->
          <div class="text-center mb-8">
            <div class="mx-auto flex items-center justify-center size-16 bg-yellow-500 rounded-2xl mb-4 shadow-lg">
              <svg class="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Nueva Contraseña
            </h2>
            <p class="mt-3 text-base text-gray-300">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <!-- Formulario -->
          <form v-if="!cambiado" @submit.prevent="resetearPassword" class="space-y-6">
            <div>
              <label for="password" class="block text-sm font-medium leading-6 text-gray-200">
                Nueva Contraseña
              </label>
              <div class="mt-2">
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="6"
                  placeholder="Mínimo 6 caracteres"
                  class="block w-full rounded-xl border-0 bg-gray-800/50 px-4 py-3.5 text-white placeholder:text-gray-400 ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all duration-200 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label for="confirmarPassword" class="block text-sm font-medium leading-6 text-gray-200">
                Confirmar Contraseña
              </label>
              <div class="mt-2">
                <input
                  id="confirmarPassword"
                  v-model="confirmarPassword"
                  type="password"
                  required
                  minlength="6"
                  placeholder="Repite tu contraseña"
                  class="block w-full rounded-xl border-0 bg-gray-800/50 px-4 py-3.5 text-white placeholder:text-gray-400 ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all duration-200 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="cargando"
                class="flex w-full justify-center rounded-xl bg-yellow-500 px-4 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="cargando" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cambiando contraseña...
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Cambiar Contraseña
                </span>
              </button>
            </div>
          </form>

          <!-- Mensaje de éxito -->
          <div v-else class="text-center space-y-4">
            <div class="mx-auto flex items-center justify-center size-16 bg-green-500/20 rounded-full mb-4">
              <svg class="size-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white">¡Contraseña actualizada!</h3>
            <p class="text-gray-300">
              Tu contraseña ha sido cambiada exitosamente
            </p>
            <button
              @click="router.push('/login')"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 transition-all duration-200"
            >
              Iniciar Sesión
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>

          <!-- Mensaje de error -->
          <div
            v-if="mensaje && !cambiado"
            class="mt-6 p-4 rounded-xl text-center font-semibold border transition-all duration-300 bg-red-900/30 text-red-400 border-red-500/30"
          >
            {{ mensaje }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const API = import.meta.env.VITE_API_URL
const password = ref('')
const confirmarPassword = ref('')
const mensaje = ref('')
const cargando = ref(false)
const cambiado = ref(false)
const isVisible = ref(false)

const resetearPassword = async () => {
  if (password.value !== confirmarPassword.value) {
    mensaje.value = '❌ Las contraseñas no coinciden'
    return
  }

  if (password.value.length < 6) {
    mensaje.value = '❌ La contraseña debe tener al menos 6 caracteres'
    return
  }

  try {
    cargando.value = true
    mensaje.value = ''

    const token = route.params.token

    await axios.post(`${API}/auth/reset-password`, {
      token,
      password: password.value
    })

    cambiado.value = true
  } catch (error) {
    mensaje.value = '❌ ' + (error.response?.data?.msg || 'Error al cambiar la contraseña')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 300)

  // Verificar si hay token en la URL
  if (!route.params.token) {
    mensaje.value = '❌ Enlace inválido'
  }
})
</script>

<style scoped>
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus {
  box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.1);
}

.shadow-2xl {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(234, 179, 8, 0.1);
}
</style>
