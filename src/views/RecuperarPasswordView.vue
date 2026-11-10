<template>
  <div class="bg-black min-h-screen relative isolate overflow-hidden">
    <!-- Fondo decorativo -->
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div
        class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-yellow-400 to-yellow-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <div class="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
      <div
        class="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-yellow-500 to-yellow-700 opacity-20 sm:left-[calc(50%+36rem)] sm:w-288.75"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <!-- Header -->
    <header class="absolute inset-x-0 top-0 z-50">
      <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5 flex items-center gap-2">
            <div class="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-8 fill-yellow-500">
                <path
                  d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z"
                />
              </svg>
            </div>
            <span class="text-white font-semibold text-lg hidden sm:block">Servicio Especializado Renault</span>
          </a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
            @click="router.push('/login')"
            class="text-sm/6 font-semibold text-white hover:text-yellow-400 transition-colors duration-200"
          >
            Volver al Login <span aria-hidden="true">&larr;</span>
          </button>
        </div>
      </nav>
    </header>

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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Olvidaste tu contraseña?
            </h2>
            <p class="mt-3 text-base text-gray-300">
              No te preocupes, te enviaremos un enlace para recuperarla
            </p>
          </div>

          <!-- Formulario -->
          <form v-if="!enviado" @submit.prevent="solicitarRecuperacion" class="space-y-6">
            <div>
              <label for="correo" class="block text-sm font-medium leading-6 text-gray-200">
                Correo electrónico
              </label>
              <div class="mt-2">
                <input
                  id="correo"
                  v-model="correo"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="tu@correo.com"
                  class="block w-full rounded-xl border-0 bg-gray-800/50 px-4 py-3.5 text-white placeholder:text-gray-400 ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all duration-200 sm:text-sm/6"
                />
              </div>
              <p class="mt-2 text-xs text-gray-400">
                Ingresa el correo asociado a tu cuenta
              </p>
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
                  Enviando...
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Enviar enlace de recuperación
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
            <h3 class="text-xl font-semibold text-white">¡Correo enviado!</h3>
            <p class="text-gray-300">
              Hemos enviado un enlace de recuperación a <strong class="text-yellow-400">{{ correo }}</strong>
            </p>
            <p class="text-sm text-gray-400">
              El enlace expirará en 1 hora. Revisa tu bandeja de entrada y spam.
            </p>
            <button
              @click="router.push('/login')"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver al login
            </button>
          </div>

          <!-- Mensaje de error -->
          <div
            v-if="mensaje && !enviado"
            class="mt-6 p-4 rounded-xl text-center font-semibold border transition-all duration-300"
            :class="mensaje.includes('✅')
              ? 'bg-green-900/30 text-green-400 border-green-500/30'
              : 'bg-red-900/30 text-red-400 border-red-500/30'"
          >
            {{ mensaje }}
          </div>

          <!-- Link adicional -->
          <div v-if="!enviado" class="mt-8 text-center">
            <p class="text-sm text-gray-400">
              ¿Recordaste tu contraseña?
              <button @click="router.push('/login')" class="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors ml-1">
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API = import.meta.env.VITE_API_URL
const correo = ref('')
const mensaje = ref('')
const cargando = ref(false)
const enviado = ref(false)
const isVisible = ref(false)

const solicitarRecuperacion = async () => {
  try {
    cargando.value = true
    mensaje.value = ''

    const res = await axios.post(`${API}/auth/recuperar-password`, {
      correo: correo.value
    })

    enviado.value = true
    mensaje.value = ''
  } catch (error) {
    mensaje.value = '❌ ' + (error.response?.data?.msg || 'Error al enviar el correo')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 300)
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
