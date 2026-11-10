<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckIcon } from '@heroicons/vue/20/solid'

const router = useRouter()
const usuario = ref(null)
const tallerActivo = ref(null)
const hoverActivo = ref(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    usuario.value = JSON.parse(userData)
  }
})

const seleccionarTaller = (taller) => {
  tallerActivo.value = taller
  // Pequeño delay antes de navegar para que se complete la animación
  setTimeout(() => {
    irATaller(taller)
  }, 400)
}

const irATaller = (taller) => {
  router.push(`/taller/${taller}`)
}

const cerrarSesion = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

// Datos de los talleres adaptados del template de pricing
const talleres = [
  {
    id: 'taller-talisman',
    nombre: 'Taller Talismán',
    descripcion: 'Especialistas en servicio Renault',
    href: '#',
    caracteristicas: [
      'Avenida Talismán 3603, Gertrudis Sánchez 1ra SECC., Gustavo A. Madero, 07460 CDMX',
      '(55) 22433546',
      'Lun-Vie: 8:00 - 18:00'
    ],
    destacado: false,
    color: 'yellow'
  },
  {
    id: 'taller-lutecia',
    nombre: 'Taller Lutecia',
    descripcion: 'Expertos en mecánica Renault',
    href: '#',
    caracteristicas: [
      'Av. Carlos Hank Gonzales Mz176 Lt.15 Fracc. Rio de luz C.P 55100',
      '(55) 63490611',
      'Lun-Vie: 7:30 - 17:30'
    ],
    destacado: true,
    color: 'blue'
  }
]
</script>

<template>
  <div class="bg-black min-h-screen relative isolate overflow-hidden">
    <!-- Efectos de fondo decorativos amarillos -->
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div
        class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-yellow-400 to-yellow-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <div class="absolute inset-x-0 top-1/3 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
      <div
        class="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-yellow-500 to-yellow-700 opacity-15 sm:left-[calc(50%+36rem)] sm:w-288.75"
        style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
      ></div>
    </div>

    <!-- Efectos de partículas/brillo adicional -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.yellow.400),transparent)] opacity-10"></div>
      <div class="absolute inset-0 bg-[radial-gradient(100rem_50rem_at_bottom,theme(colors.yellow.600),transparent)] opacity-10"></div>
    </div>

    <!-- Efectos de brillo flotante -->
    <div class="absolute top-1/4 left-1/4 -z-10">
      <div class="w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-10 animate-pulse"></div>
    </div>
    <div class="absolute bottom-1/4 right-1/4 -z-10">
      <div class="w-96 h-96 bg-yellow-600 rounded-full blur-3xl opacity-5 animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- CONTENIDO PRINCIPAL - Adaptado del template de pricing -->
    <div class="relative isolate px-6 py-24 sm:py-32 lg:px-8 min-h-screen flex items-center justify-center">
      <!-- Efecto decorativo adicional del template pricing -->
      <div class="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
        <div class="mx-auto aspect-1155/678 w-288.75 bg-gradient-to-tr from-yellow-500 to-yellow-600 opacity-10" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>

      <div class="mx-auto max-w-7xl">
        <!-- Encabezado del template pricing -->
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="text-base/7 font-semibold text-yellow-400">Nuestros Talleres</h2>
          <p class="mt-2 text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
            Selecciona tu taller
          </p>
        </div>
        <p class="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
          Elige el taller Renault al que estes actualmente. Ambos ofrecen el servicio de la generación de notas para los clientes.
        </p>

        <!-- Grid de talleres adaptado del template pricing -->
        <div class="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-8">
          <div
            v-for="(taller, tierIdx) in talleres"
            :key="taller.id"
            @click="seleccionarTaller(taller.id.replace('taller-', ''))"
            @mouseenter="hoverActivo = taller.id.replace('taller-', '')"
            @mouseleave="hoverActivo = null"
            :class="[
              taller.destacado ? 'relative bg-gray-800/50 backdrop-blur-sm' : 'bg-white/5 backdrop-blur-sm lg:mx-0',
              taller.destacado ? '' : tierIdx === 0 ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl' : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
              'rounded-3xl p-8 ring-1 ring-yellow-500/20 sm:p-10 cursor-pointer transition-all duration-500 ease-out min-h-[480px] flex flex-col justify-between',
              // Animaciones basadas en el taller activo (click)
              tallerActivo === taller.id.replace('taller-', '')
                ? 'transform scale-105 z-20 shadow-2xl border-2 border-yellow-500/50'
                : tallerActivo && tallerActivo !== taller.id.replace('taller-', '')
                  ? 'transform scale-95 opacity-80 z-10'
                  : 'z-0',
              // Animaciones basadas en el hover
              hoverActivo === taller.id.replace('taller-', '') && !tallerActivo
                ? 'transform scale-105 z-20 shadow-xl border border-yellow-500/30'
                : hoverActivo && hoverActivo !== taller.id.replace('taller-', '') && !tallerActivo
                  ? 'transform scale-95 opacity-90 z-10'
                  : ''
            ]"
          >
            <!-- Contenido de la card adaptado del template pricing -->
            <div>
              <!-- Icono del taller -->
              <div :class="`w-16 h-16 ${
                taller.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'
              } rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
                (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                  ? 'scale-110 shadow-lg'
                  : 'shadow-md'
              }`">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="w-8 h-8 fill-white">
                  <path
                    d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z"
                  />
                </svg>
              </div>

              <h3 :id="taller.id" :class="[
                taller.destacado ? 'text-yellow-400' : (taller.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'),
                'text-base/7 font-semibold text-center transition-colors duration-300',
                (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                  ? 'text-white'
                  : ''
              ]">{{ taller.nombre }}</h3>

              <p class="mt-4 flex items-baseline gap-x-2 justify-center">
                <span :class="[
                  taller.destacado ? 'text-white' : 'text-white',
                  'text-2xl font-semibold tracking-tight transition-colors duration-300'
                ]">{{ taller.descripcion }}</span>
              </p>

              <p :class="[
                taller.destacado ? 'text-gray-300' : 'text-gray-300',
                'mt-6 text-base/7 text-center transition-colors duration-300',
                (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                  ? 'text-gray-200'
                  : ''
              ]">Servicio especializado Renault</p>

              <ul role="list" :class="[
                taller.destacado ? 'text-gray-300' : 'text-gray-300',
                'mt-8 space-y-3 text-sm/6 sm:mt-10 transition-colors duration-300',
                (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                  ? 'text-gray-200'
                  : ''
              ]">
                <li v-for="caracteristica in taller.caracteristicas" :key="caracteristica" class="flex gap-x-3 group">
                  <CheckIcon :class="[
                    taller.destacado ? (taller.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400') : (taller.color === 'yellow' ? 'text-yellow-500' : 'text-blue-500'),
                    'h-6 w-5 flex-none transition-all duration-300 group-hover:scale-110',
                    (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                      ? (taller.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400')
                      : ''
                  ]" aria-hidden="true" />
                  <span class="group-hover:text-white transition-colors duration-200">{{ caracteristica }}</span>
                </li>
              </ul>
            </div>

            <button
              @click.stop="seleccionarTaller(taller.id.replace('taller-', ''))"
              :class="[
                taller.destacado
                  ? (taller.color === 'yellow' ? 'bg-yellow-500 text-white hover:bg-yellow-400 focus-visible:outline-yellow-500' : 'bg-blue-500 text-white hover:bg-blue-400 focus-visible:outline-blue-500')
                  : 'bg-white/10 text-white inset-ring inset-ring-white/5 hover:bg-white/20 focus-visible:outline-white/75',
                'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 transition-all duration-300',
                (tallerActivo === taller.id.replace('taller-', '') || hoverActivo === taller.id.replace('taller-', ''))
                  ? 'ring-2 ring-white transform scale-105'
                  : 'hover:scale-105'
              ]"
            >
              Ingresar a {{ taller.nombre.replace('Taller ', '') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para la perspectiva 3D */
.perspective-1000 {
  perspective: 1000px;
}

/* Transiciones suaves para todos los elementos transformables */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de brillo para el card activo */
.shadow-glow {
  box-shadow:
    0 0 30px rgba(234, 179, 8, 0.3),
    0 0 60px rgba(234, 179, 8, 0.1);
}

/* Asegurar que los botones mantengan su estilo */
button {
  z-index: 30;
}

/* Mejoras para la experiencia táctil en móviles */
@media (max-width: 768px) {
  .cursor-pointer {
    cursor: default;
  }
}

/* Efectos de glassmorphism */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Gradientes de texto */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Sombras mejoradas */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

/* Animaciones de hover mejoradas */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Efectos de profundidad para las cards */
.card-depth {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(234, 179, 8, 0.1);
}

/* Efecto inset ring para botones */
.inset-ring {
  box-shadow: inset 0 0 0 1px;
}
</style>
