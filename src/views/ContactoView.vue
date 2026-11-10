<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  MapPinIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_URL

// Catálogo de servicios disponibles
const opcionesServicios = [
  'Afinación Mayor y Menor',
  'Kit de Distribución y Bomba de Agua',
  'Sistema de Frenos y Módulo ABS',
  'Suspensión, Amortiguadores y Dirección',
  'Diagnóstico por Escáner / Testigo de Motor',
  'Embrague / Clutch y Transmisión',
  'Sistema Eléctrico y Aire Acondicionado',
  'Mantenimiento Preventivo por Kilometraje',
  'Reparación General de Motor / Otro'
]

// Modelos populares de Renault para autocompletado/sugerencias rápidas
const modelosRenault = [
  'Duster',
  'Kwid',
  'Stepway',
  'Sandero',
  'Logan',
  'Oroch',
  'Koleos',
  'Kangoo',
  'Kardian',
  'Clio',
  'Megane',
  'Fluence',
  'Otro Renault'
]

// Formulario de cotización de servicio
const formulario = ref({
  nombreCompleto: '',
  telefono: '',
  correo: '',
  servicio: 'Afinación Mayor y Menor',
  modeloAuto: '',
  mensaje: ''
})

const cargando = ref(false)
const mensajeError = ref('')

const validarFormulario = () => {
  if (!formulario.value.nombreCompleto.trim()) {
    mensajeError.value = 'Por favor ingresa tu nombre completo'
    return false
  }

  if (!formulario.value.telefono.trim()) {
    mensajeError.value = 'Por favor ingresa tu número telefónico o WhatsApp'
    return false
  }

  const telefonoLimpio = formulario.value.telefono.replace(/\D/g, '')
  if (telefonoLimpio.length < 10) {
    mensajeError.value = 'El teléfono debe contener al menos 10 dígitos para poder contactarte'
    return false
  }

  if (!formulario.value.correo.trim()) {
    mensajeError.value = 'Por favor ingresa tu correo electrónico'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formulario.value.correo.trim())) {
    mensajeError.value = 'Por favor ingresa un correo electrónico válido'
    return false
  }

  mensajeError.value = ''
  return true
}

const enviarFormulario = () => {
  if (!validarFormulario()) return

  cargando.value = true
  mensajeError.value = ''

  const payload = {
    nombreCompleto: formulario.value.nombreCompleto.trim(),
    telefono: formulario.value.telefono.trim(),
    correo: formulario.value.correo.trim(),
    servicio: formulario.value.servicio,
    modeloAuto: formulario.value.modeloAuto.trim() || 'No especificado',
    mensaje: formulario.value.mensaje.trim()
  }

  const numeroWhatsappTaller = '525522433546'
  const textoWhatsapp = `¡Hola! Me gustaría cotizar un servicio para mi auto Renault:
• Cliente: ${payload.nombreCompleto}
• Teléfono: ${payload.telefono}
• Correo: ${payload.correo}
• Servicio requerido: ${payload.servicio}
• Modelo y Año: ${payload.modeloAuto}
${payload.mensaje ? `• Detalles / Síntomas: ${payload.mensaje}` : ''}`

  const urlWhatsapp = `https://wa.me/${numeroWhatsappTaller}?text=${encodeURIComponent(textoWhatsapp)}`

  // 1. Guardar en segundo plano en la Base de Datos para asegurar el prospecto
  axios.post(`${API}/auth/contacto`, payload).catch(err => {
    console.warn('Registro en BD en segundo plano:', err.message)
  })

  // 2. Abrir WhatsApp directamente con el número del taller
  window.open(urlWhatsapp, '_blank')

  // 3. Notificación toast de éxito
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: '¡Abriendo WhatsApp para enviar tu solicitud!',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#18181b',
    color: '#ffffff'
  })

  // Limpiar formulario
  formulario.value = {
    nombreCompleto: '',
    telefono: '',
    correo: '',
    servicio: 'Afinación Mayor y Menor',
    modeloAuto: '',
    mensaje: ''
  }

  cargando.value = false
}
</script>

<template>
  <div class="bg-zinc-950 text-zinc-100 min-h-screen relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <!-- Fondo tecnológico avanzado: Partículas doradas, blueprint, malla y paneles -->
    <TechBackground />

    <!-- Encabezado Glassmorphism -->
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
            <span class="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide truncate">Cotizaciones y Citas</span>
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

    <!-- Contenido Principal: Dos Columnas en Desktop -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        <!-- Columna Izquierda: Información de Taller & Confianza -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wide uppercase mb-4">
              <SparklesIcon class="size-4" />
              Atención Exclusiva Renault
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Solicita tu <span class="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Cotización</span> de Servicio
            </h1>

            <p class="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Explícanos qué necesita tu automóvil. Nuestro equipo especializado te responderá con un diagnóstico preliminar y un presupuesto transparente sin compromisos.
            </p>
          </div>

          <!-- Pilares de Confianza -->
          <div class="space-y-3 pt-2">
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3.5">
              <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                <ShieldCheckIcon class="size-5" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-white">Diagnóstico Preciso</h2>
                <p class="text-xs text-zinc-400 mt-0.5">Escáner original para Renault, evitando adivinanzas y cambios innecesarios de piezas.</p>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-start gap-3.5">
              <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                <CheckCircleIcon class="size-5" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-white">Garantía Escrita</h2>
                <p class="text-xs text-zinc-400 mt-0.5">Respaldamos cada mano de obra y refacción con hoja de inspección digital oficial.</p>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Contacto Directo Rápido -->
          <div class="p-6 rounded-3xl bg-zinc-900/80 border border-yellow-500/20 shadow-xl space-y-4">
            <div class="flex items-center gap-3 text-xs font-bold text-yellow-400 uppercase tracking-wider">
              <span>¿Prefieres atención inmediata?</span>
            </div>

            <div class="flex items-start gap-3">
              <MapPinIcon class="size-5 text-yellow-400 shrink-0 mt-0.5" />
              <div class="text-xs text-zinc-300 leading-relaxed">
                <strong class="text-white block text-sm">Taller Talismán:</strong>
                Av. Talismán 3603, Col. Gertrudis Sánchez 1ra Secc., GAM, CDMX.
              </div>
            </div>

            <div class="flex items-center gap-3">
              <PhoneIcon class="size-5 text-yellow-400 shrink-0" />
              <div>
                <div class="text-xs text-zinc-400">Llámanos o escríbenos:</div>
                <a href="tel:5522433546" class="text-lg font-mono font-bold text-white hover:text-yellow-400 transition-colors">
                  (55) 2243-3546
                </a>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs text-zinc-400 pt-1 border-t border-white/5">
              <ClockIcon class="size-4 text-zinc-400 shrink-0" />
              <span>Lun a Vie: 8:00 AM – 6:00 PM | Sáb: 8:00 AM – 2:00 PM</span>
            </div>

            <div class="pt-2">
              <a
                href="https://wa.me/525522433546?text=Hola,%20quisiera%20cotizar%20un%20servicio%20para%20mi%20auto%20Renault."
                target="_blank"
                rel="noopener noreferrer"
                class="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                <span>📲 Chat de WhatsApp (55 2243 3546)</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Formulario Orientado a Servicio -->
        <div class="lg:col-span-7">
          <div class="relative rounded-3xl p-6 sm:p-9 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl ring-1 ring-yellow-500/10 overflow-hidden">
            <!-- Borde de acento luminoso superior -->
            <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>

            <div class="mb-6">
              <h2 class="text-xl sm:text-2xl font-bold text-white">Datos de tu Solicitud</h2>
              <p class="text-xs sm:text-sm text-zinc-400 mt-1">Completa los campos a continuación para recibir tu presupuesto personalizado.</p>
            </div>

            <form @submit.prevent="enviarFormulario" class="space-y-4 sm:space-y-5">
              <!-- Nombre Completo -->
              <div>
                <label for="nombreCompleto" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                  Nombre Completo <span class="text-yellow-400">*</span>
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <UserIcon class="size-5" />
                  </div>
                  <input
                    id="nombreCompleto"
                    v-model="formulario.nombreCompleto"
                    type="text"
                    required
                    placeholder="Ej. Roberto Martínez García"
                    class="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                  />
                </div>
              </div>

              <!-- Teléfono y Correo en 2 columnas -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="telefono" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                    Teléfono / WhatsApp <span class="text-yellow-400">*</span>
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <PhoneIcon class="size-5" />
                    </div>
                    <input
                      id="telefono"
                      v-model="formulario.telefono"
                      type="tel"
                      required
                      placeholder="10 dígitos (ej. 5512345678)"
                      class="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label for="correo" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                    Correo Electrónico <span class="text-yellow-400">*</span>
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <EnvelopeIcon class="size-5" />
                    </div>
                    <input
                      id="correo"
                      v-model="formulario.correo"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      class="block w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <!-- Selección de Servicio y Modelo Renault en 2 columnas -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Combo de Servicio -->
                <div>
                  <label for="servicio" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                    Servicio que requieres <span class="text-yellow-400">*</span>
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-yellow-400">
                      <WrenchScrewdriverIcon class="size-5" />
                    </div>
                    <select
                      id="servicio"
                      v-model="formulario.servicio"
                      required
                      class="block w-full h-12 pl-11 pr-10 rounded-xl bg-zinc-950/70 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VhYjMwOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cGF0aCBkPSJNNy40MSA4LjU5TDEyIDEzLjE3bDQuNTktNC41OEwxOCAxMGwtNiA2LTYtNnoiLz48L3N2Zz4=')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option
                        v-for="opcion in opcionesServicios"
                        :key="opcion"
                        :value="opcion"
                        class="bg-zinc-900 text-white py-2"
                      >
                        {{ opcion }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Modelo y Año -->
                <div>
                  <label for="modeloAuto" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                    Modelo y Año de tu Renault
                  </label>
                  <div class="relative">
                    <input
                      id="modeloAuto"
                      v-model="formulario.modeloAuto"
                      type="text"
                      list="listaModelos"
                      placeholder="Ej. Duster 2019 / Kwid 2022"
                      class="block w-full h-12 px-4 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                    />
                    <datalist id="listaModelos">
                      <option v-for="m in modelosRenault" :key="m" :value="m" />
                    </datalist>
                  </div>
                </div>
              </div>

              <!-- Campo de Detalle / Síntomas o Especificaciones -->
              <div>
                <label for="mensaje" class="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
                  ¿Qué síntomas presenta tu auto o qué necesitas que revisemos?
                </label>
                <div class="relative">
                  <textarea
                    id="mensaje"
                    v-model="formulario.mensaje"
                    rows="3"
                    placeholder="Describe ruidos, testigos prendidos en el tablero (check engine/abs), kilometraje actual o cualquier detalle que nos ayude a darte el mejor presupuesto..."
                    class="block w-full p-3.5 rounded-xl bg-zinc-950/60 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all leading-relaxed resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Alerta de Error si hay campos incompletos -->
              <div
                v-if="mensajeError"
                class="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm bg-rose-500/10 border-rose-500/30 text-rose-300"
              >
                <DocumentTextIcon class="size-5 text-rose-400 shrink-0" />
                <span>{{ mensajeError }}</span>
              </div>

              <!-- Botón de Envío Directo a WhatsApp -->
              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="cargando"
                  class="w-full h-13 rounded-xl bg-yellow-500 text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-yellow-400 shadow-xl shadow-yellow-500/25 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg class="size-5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.978-.953 1.18-.176.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.492-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.244-.588-.493-.508-.678-.518-.176-.009-.376-.011-.577-.011-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.91 1.23 3.111.15.201 2.124 3.243 5.145 4.549.718.311 1.279.497 1.716.636.723.23 1.381.197 1.901.12.579-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062a8.04 8.04 0 01-4.103-1.121l-.294-.175-3.05.854.819-2.97-.192-.307A8.048 8.048 0 1112 20.062z"/>
                  </svg>
                  <span>Enviar Solicitud por WhatsApp</span>
                  <ArrowRightIcon class="size-4 text-black stroke-[2.5]" />
                </button>
              </div>

              <div class="text-center pt-2">
                <span class="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                  <ShieldCheckIcon class="size-4 text-emerald-400" />
                  Se abrirá tu WhatsApp para enviar la solicitud directa al (55) 2243-3546 del taller.
                </span>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>

    <!-- Footer Discreto -->
    <footer class="w-full py-5 text-center text-xs text-zinc-600 border-t border-white/5 bg-zinc-950/40">
      © {{ new Date().getFullYear() }} Servicio Mecánico Especializado Renault &bull; Av. Talismán 3603, GAM, CDMX &bull; Tel: (55) 2243-3546
    </footer>
  </div>
</template>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
