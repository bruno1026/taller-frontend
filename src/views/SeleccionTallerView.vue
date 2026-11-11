<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const router = useRouter()
const usuario = ref(null)
const tallerActivo = ref(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      usuario.value = JSON.parse(userData)
    } catch (e) {
      usuario.value = null
    }
  }
})

const seleccionarTaller = (tallerId) => {
  tallerActivo.value = tallerId
  setTimeout(() => {
    irATaller(tallerId)
  }, 250)
}

const irATaller = (tallerId) => {
  router.push(`/taller/${tallerId}`)
}

const talleres = [
  {
    id: 'talisman',
    codigo: 'SUCURSAL 01 // CDMX',
    nombre: 'Taller Talismán',
    subtitulo: 'Especialistas en Servicio y Diagnóstico Renault',
    descripcion: 'Centro técnico principal equipado para mantenimientos mayores, diagnóstico computarizado y laboratorio de inyección.',
    direccion: 'Avenida Talismán 3603, Gertrudis Sánchez 1ra Secc., Gustavo A. Madero, 07460 Ciudad de México',
    telefono: '(55) 2243-3546',
    horario: 'Lunes a Viernes: 8:00 - 18:00 hrs',
    equipamiento: 'Escáner Original Renault Can-Clip • Rampa Hidráulica • Torno de Frenos',
    serviciosClave: ['Afinación Mayor y Menor', 'Banda de Distribución', 'Frenos y Suspensión']
  },
  {
    id: 'lutecia',
    codigo: 'SUCURSAL 02 // EDOMEX',
    nombre: 'Taller Lutecia',
    subtitulo: 'Expertos en Mecánica y Transmisiones Renault',
    descripcion: 'Unidad de servicio especializada en reparaciones mecánicas integrales, tren motriz, cajas automáticas CVT y sistemas de enfriamiento.',
    direccion: 'Av. Carlos Hank González Mz 176 Lt 15, Fracc. Río de Luz, C.P. 55100, Ecatepec de Morelos',
    telefono: '(55) 6340-0611',
    horario: 'Lunes a Viernes: 7:30 - 17:30 hrs',
    equipamiento: 'Diagnóstico Electrónico • Ajuste de Motores • Servicio de Transmisiones CVT',
    serviciosClave: ['Transmisión y Embrague', 'Alineación de Motor', 'Sistema Eléctrico y A/C']
  }
]
</script>

<template>
  <div class="min-h-screen text-zinc-100 relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <!-- Fondo tecnologico de alta gama: Blueprint, particulas, mallas y paneles -->
    <TechBackground />

    <!-- Contenedor Central de Seleccion de Taller -->
    <main class="flex-1 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14 py-8 sm:py-12 flex flex-col justify-center">
      <!-- Cabecera de la Seccion -->
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs sm:text-sm font-semibold tracking-wide mb-5">
          <span class="size-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>Red de Talleres Especializados Renault</span>
        </div>

        <!-- Titulo Principal -->
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Selecciona tu <span class="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">taller activo</span>
        </h1>

        <!-- Descripcion -->
        <p class="mt-4 text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Elige la sucursal en la que operarás el día de hoy para gestionar notas de servicio, diagnósticos computarizados y emisión de presupuestos oficiales.
        </p>
      </div>

      <!-- Grid de Talleres: 2 Columnas Sincronizadas y Proporcionales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl 2xl:max-w-7xl mx-auto w-full">
        <div
          v-for="taller in talleres"
          :key="taller.id"
          @click="seleccionarTaller(taller.id)"
          :class="[
            'rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-2xl backdrop-blur-xl cursor-pointer',
            tallerActivo === taller.id
              ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-[1.02] shadow-yellow-500/20'
              : 'border-white/10 hover:border-yellow-500/50 hover:-translate-y-1 hover:shadow-yellow-500/10'
          ]"
        >
          <!-- Borde superior luminoso activo al hover -->
          <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>

          <div>
            <!-- Fila superior: Logo Renault + Estatus Operativo -->
            <div class="flex items-center justify-between gap-4 mb-6">
              <div class="size-13 sm:size-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-7 fill-black">
                  <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
                </svg>
              </div>

              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shrink-0">
                <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sucursal Operativa</span>
              </div>
            </div>

            <!-- Identificacion de Sucursal y Nombre -->
            <div class="mb-4">
              <span class="text-[11px] font-mono font-bold tracking-wider text-yellow-500 uppercase block mb-1">
                {{ taller.codigo }}
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-yellow-400 transition-colors">
                {{ taller.nombre }}
              </h2>
              <p class="text-sm font-semibold text-zinc-300 mt-1">
                {{ taller.subtitulo }}
              </p>
              <p class="text-xs text-zinc-400 mt-2 leading-relaxed">
                {{ taller.descripcion }}
              </p>
            </div>

            <!-- Fichas de Informacion y Ubicacion -->
            <div class="space-y-3.5 my-6 pt-5 border-t border-white/5">
              <!-- Direccion -->
              <div class="flex items-start gap-3 text-xs sm:text-sm">
                <div class="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0 mt-0.5">
                  <MapPinIcon class="size-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ubicación</span>
                  <span class="text-zinc-200 font-medium leading-snug">{{ taller.direccion }}</span>
                </div>
              </div>

              <!-- Telefono -->
              <div class="flex items-start gap-3 text-xs sm:text-sm">
                <div class="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0 mt-0.5">
                  <PhoneIcon class="size-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Teléfono Directo</span>
                  <span class="text-zinc-200 font-medium font-mono">{{ taller.telefono }}</span>
                </div>
              </div>

              <!-- Horario -->
              <div class="flex items-start gap-3 text-xs sm:text-sm">
                <div class="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0 mt-0.5">
                  <ClockIcon class="size-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horario de Taller</span>
                  <span class="text-zinc-200 font-medium">{{ taller.horario }}</span>
                </div>
              </div>

              <!-- Equipamiento -->
              <div class="flex items-start gap-3 text-xs sm:text-sm">
                <div class="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0 mt-0.5">
                  <WrenchScrewdriverIcon class="size-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Equipamiento Técnico</span>
                  <span class="text-zinc-400 text-xs leading-relaxed">{{ taller.equipamiento }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Boton de Accion Principal -->
          <div class="pt-5 border-t border-white/5">
            <button
              type="button"
              @click.stop="seleccionarTaller(taller.id)"
              class="w-full h-12 sm:h-14 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-yellow-500/25 active:scale-[0.98] transition-all cursor-pointer group/btn"
            >
              <span>Ingresar a {{ taller.nombre.replace('Taller ', '') }}</span>
              <ArrowRightIcon class="size-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
