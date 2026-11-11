<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  PaperAirplaneIcon,
  BellIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Estado del formulario
const form = ref({
  activo: true,
  token: '9294600811:AAH6FNZhgLLEXzt3v6RXEw6P2uTt475oXIo',
  chatId: '1600161481'
})

const cargando = ref(false)
const guardando = ref(false)
const probando = ref(false)
const mostrarToken = ref(false)

const obtenerHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

// Cargar configuración guardada desde el backend
const cargarConfiguracion = async () => {
  cargando.value = true
  try {
    const res = await axios.get(`${API}/telegram/config`, obtenerHeaders())
    if (res.data?.ok && res.data.config) {
      form.value.activo = res.data.config.activo ?? true
      if (res.data.config.token) form.value.token = res.data.config.token
      if (res.data.config.chatId) form.value.chatId = res.data.config.chatId
    }
  } catch (error) {
    console.warn('No se pudo cargar configuración de Telegram:', error.message)
  } finally {
    cargando.value = false
  }
}

// Probar envío de mensaje en vivo
const probarEnvio = async () => {
  if (!form.value.token || !form.value.chatId) {
    Swal.fire({
      title: 'Datos Incompletos',
      text: 'Debes ingresar el Token del Bot y el Chat ID para realizar la prueba.',
      icon: 'warning',
      background: '#0B132B',
      color: '#ffffff',
      confirmButtonColor: '#0ea5e9'
    })
    return
  }

  probando.value = true
  try {
    const res = await axios.post(
      `${API}/telegram/test`,
      {
        token: form.value.token,
        chatId: form.value.chatId
      },
      obtenerHeaders()
    )

    if (res.data?.ok) {
      Swal.fire({
        title: '¡Mensaje Enviado!',
        text: 'Revisa tu chat de Telegram. Se ha entregado la notificación de prueba exitosamente.',
        icon: 'success',
        background: '#0B132B',
        color: '#ffffff',
        confirmButtonColor: '#0ea5e9'
      })
    } else {
      throw new Error(res.data?.msg || 'Error en la API de Telegram')
    }
  } catch (err) {
    console.error('Error al probar Telegram:', err)
    Swal.fire({
      title: 'Fallo al Enviar',
      text: err.response?.data?.msg || err.message || 'Verifica que el token sea correcto y que hayas iniciado conversación con el bot (/start).',
      icon: 'error',
      background: '#0B132B',
      color: '#ffffff',
      confirmButtonColor: '#0ea5e9'
    })
  } finally {
    probando.value = false
  }
}

// Guardar configuración en el backend
const guardarConfiguracion = async () => {
  guardando.value = true
  try {
    const res = await axios.put(
      `${API}/telegram/config`,
      {
        activo: form.value.activo,
        token: form.value.token,
        chatId: form.value.chatId
      },
      obtenerHeaders()
    )

    if (res.data?.ok) {
      Swal.fire({
        title: 'Configuración Guardada',
        text: 'Las preferencias del Bot de Telegram han sido actualizadas.',
        icon: 'success',
        background: '#0B132B',
        color: '#ffffff',
        confirmButtonColor: '#0ea5e9'
      })
    }
  } catch (err) {
    console.error('Error al guardar configuración de Telegram:', err)
    Swal.fire({
      title: 'Error al Guardar',
      text: err.response?.data?.msg || err.message,
      icon: 'error',
      background: '#0B132B',
      color: '#ffffff',
      confirmButtonColor: '#0ea5e9'
    })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarConfiguracion()
})
</script>

<template>
  <div class="relative min-h-[calc(100vh-4rem)] flex flex-col justify-start items-center p-4 sm:p-8 overflow-hidden">
    <TechBackground />

    <div class="relative z-10 w-full max-w-5xl space-y-6">

      <!-- ENCABEZADO DE SECCIÓN -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Canal Oficial de Alertas</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monitoreo en Tiempo Real
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Administra la conexión con Telegram para supervisar la operatividad de tus sistemas y recibir alertas inmediatas.
          </p>
        </div>

        <button
          type="button"
          @click="cargarConfiguracion"
          :disabled="cargando"
          class="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-cyan-500/30 text-zinc-300 hover:text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <ArrowPathIcon class="size-4" :class="{ 'animate-spin': cargando }" />
          <span>Recargar</span>
        </button>
      </div>

      <!-- TARJETA PRINCIPAL DE CONFIGURACIÓN DE TELEGRAM -->
      <div class="w-full rounded-3xl bg-[#091122]/95 border border-cyan-500/25 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-slate-100 backdrop-blur-xl">

        <!-- CABECERA DE LA TARJETA -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
          <div class="flex items-center gap-4">
            <!-- Ícono Telegram -->
            <div class="size-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 shrink-0">
              <svg class="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
              </svg>
            </div>

            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-xl font-bold tracking-tight text-white">Notificaciones de Telegram</h2>
                <span
                  :class="form.activo
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'"
                  class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                >
                  {{ form.activo ? '• NOTIFICACIONES ACTIVAS' : '• DESACTIVADO' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 max-w-2xl">
                Bot oficial de monitoreo. Envía alertas en tiempo real ante caídas y reportes automáticos del estado del sistema.
              </p>
            </div>
          </div>

          <!-- Botón Probar Envío -->
          <button
            type="button"
            @click="probarEnvio"
            :disabled="probando"
            class="self-start sm:self-center px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <PaperAirplaneIcon class="size-4" :class="{ 'animate-pulse': probando }" />
            <span>{{ probando ? 'Enviando prueba...' : 'Probar Envío a Telegram' }}</span>
          </button>
        </div>

        <!-- FILA DEL INTERRUPTOR PRINCIPAL (ACTIVAR / DESACTIVAR) -->
        <div class="mt-6 p-4 rounded-2xl bg-[#060c18] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <BellIcon class="size-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Envío de notificaciones automáticas</h4>
              <p class="text-xs text-slate-400 mt-0.5">
                El monitor enviará alertas instantáneas ante cualquier falla y el resumen a las 12:00.
              </p>
            </div>
          </div>

          <!-- Switch Toggle -->
          <label class="relative inline-flex items-center gap-3 cursor-pointer select-none self-end sm:self-center">
            <span class="text-xs font-bold uppercase tracking-wider" :class="form.activo ? 'text-cyan-400' : 'text-slate-500'">
              {{ form.activo ? 'ACTIVADO' : 'DESACTIVADO' }}
            </span>
            <input type="checkbox" v-model="form.activo" class="sr-only peer" />
            <div class="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <!-- FORMULARIO DE CREDENCIALES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <!-- Token del Bot -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-300">Token del Bot (API Telegram)</label>
              <span class="text-[11px] text-slate-400 font-mono">Desde @BotFather</span>
            </div>
            <div class="relative flex items-center">
              <KeyIcon class="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                :type="mostrarToken ? 'text' : 'password'"
                v-model="form.token"
                placeholder="Ejemplo: 9294600811:AAH6..."
                class="w-full bg-[#060c18] border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 font-mono focus:outline-none transition-colors"
              />
              <button
                type="button"
                @click="mostrarToken = !mostrarToken"
                class="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Mostrar / Ocultar Token"
              >
                <EyeSlashIcon v-if="mostrarToken" class="size-4" />
                <EyeIcon v-else class="size-4" />
              </button>
            </div>
          </div>

          <!-- Chat ID / Canal -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-300">Chat ID / Canal</label>
              <span class="text-[11px] text-slate-400 font-mono">Grupo o chat personal</span>
            </div>
            <div class="relative flex items-center">
              <ChatBubbleLeftRightIcon class="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                v-model="form.chatId"
                placeholder="Ejemplo: 9294600811"
                class="w-full bg-[#060c18] border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- TARJETAS INFORMATIVAS DE MENSAJES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="p-4 rounded-xl bg-[#060c18]/80 border border-slate-800 text-xs">
            <div class="font-bold text-slate-200 flex items-center gap-2 mb-1.5">
              <XCircleIcon class="size-4 text-red-400 shrink-0" />
              <span>Mensaje 1: Detección Instantánea de Fallas</span>
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              Si el sistema deja de responder, el bot enviará al instante <code class="text-red-400">❌ (Sistema)</code> o <code class="text-amber-400">⚠️ (Sistema)</code> con el detalle del error detectado.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-[#060c18]/80 border border-slate-800 text-xs">
            <div class="font-bold text-slate-200 flex items-center gap-2 mb-1.5">
              <CheckCircleIcon class="size-4 text-emerald-400 shrink-0" />
              <span>Mensaje 2: Reporte Diario Programado</span>
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              Todos los días en punto de las 12:00 se envía un reporte de confirmación con <code class="text-emerald-400">✅ (Sistema)</code> para validar que todo opera con normalidad.
            </p>
          </div>
        </div>

        <!-- PIE DE ACCIONES Y SEGURIDAD -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-5 border-t border-cyan-500/15">
          <div class="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheckIcon class="size-4 text-cyan-400 shrink-0" />
            <span>Las credenciales de Telegram se almacenan de forma segura en la base de datos interna.</span>
          </div>

          <button
            type="button"
            @click="guardarConfiguracion"
            :disabled="guardando"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {{ guardando ? 'Guardando...' : 'Guardar Configuración de Telegram' }}
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

