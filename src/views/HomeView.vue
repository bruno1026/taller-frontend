<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogPanel } from '@headlessui/vue'
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  SparklesIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'
import TechBackground from '../components/TechBackground.vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const usuario = ref(null)
const mobileMenuOpen = ref(false)
const categoriaFiltro = ref('todos')
const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

let gsapCtx = null

// Navegación
const irALogin = () => router.push('/login')
const irAContacto = () => router.push('/contacto')
const irASeleccionTaller = () => router.push('/seleccion-taller')

// Métricas de trayectoria
const metricas = [
  { valor: '+15', sufijo: 'Años', etiqueta: 'De Experiencia', detalle: 'Especialistas exclusivos en Renault' },
  { valor: '+6,500', sufijo: '', etiqueta: 'Autos Atendidos', detalle: 'Clientes satisfechos y fidelizados' },
  { valor: '100%', sufijo: '', etiqueta: 'Garantía Escrita', detalle: 'En refacciones y mano de obra' },
  { valor: '17+', sufijo: 'Modelos', etiqueta: 'Gama Renault', detalle: 'Desde 2001 hasta línea 2026' }
]

// Qué es lo que hacemos
const pilares = [
  {
    titulo: 'Diagnóstico Computarizado Especializado',
    descripcion: 'Utilizamos escáneres con protocolos de comunicación específicos para Renault, detectando fallas en módulos ECU, sistemas de inyección, ABS y bolsas de aire sin adivinanzas.',
    icono: CpuChipIcon
  },
  {
    titulo: 'Mantenimiento Preventivo y Correctivo',
    descripcion: 'Aplicamos los programas oficiales de servicio según kilometraje, utilizando lubricantes sintéticos aprobados (Elf/Motrio) y refacciones de alta durabilidad.',
    icono: WrenchScrewdriverIcon
  },
  {
    titulo: 'Inspección Transparente con Nota Digital',
    descripcion: 'Revisamos minuciosamente cada vehículo a su llegada y emitimos una nota de servicio profesional con diagrama de carrocería, desglose de costos y garantía clara.',
    icono: DocumentTextIcon
  }
]

// Lista detallada de servicios
const servicios = [
  {
    nombre: 'Afinación Mayor y Menor',
    descripcion: 'Cambio de aceite sintético de viscosidad homologada, reemplazo de bujías, filtro de aire, filtro de aceite, filtro de gasolina y lavado de cuerpo de aceleración.',
    badge: 'Más Solicitado'
  },
  {
    nombre: 'Sistema de Frenos y Seguridad',
    descripcion: 'Cambio de balatas de compuesto cerámico, rectificado de discos y tambores, purga hidráulica con líquido DOT 4 y revisión del módulo ABS.',
    badge: 'Seguridad'
  },
  {
    nombre: 'Kit de Distribución y Bandas',
    descripcion: 'Reemplazo preventivo del kit de distribución (banda, poleas tensoras y bomba de agua) para evitar daños severos al motor por desgaste de tiempo.',
    badge: 'Crítico'
  },
  {
    nombre: 'Suspensión y Dirección',
    descripcion: 'Diagnóstico y sustitución de amortiguadores, bases, horquillas, terminales, bieletas, bujes y alineación de precisión para un manejo suave y seguro.',
    badge: 'Confort'
  },
  {
    nombre: 'Embrague y Transmisiones',
    descripcion: 'Mantenimiento y cambio de kit de clutch (disco, prensa y collarín), revisión de transmisiones manuales y automáticas con fluidos especializados.',
    badge: 'Rendimiento'
  },
  {
    nombre: 'Sistema Eléctrico y Climatización',
    descripcion: 'Reparación de marchas, alternadores, diagnóstico de sensores, recarga y detección de fugas de gas refrigerante en aire acondicionado.',
    badge: 'Electrónica'
  }
]

// Lista completa de carros que recibimos con años exactos de comercialización en México y especialidades
const catalogoVehiculos = [
  { nombre: 'DUSTER', categoria: 'suv', descripcion: '1.6L, 2.0L y Turbo 1.3L', icono: 'SUV', años: '2012 — 2026', servicios: 'Distribución • 4x4 • Frenos' },
  { nombre: 'KWID', categoria: 'hatchback', descripcion: '1.0L 3 Cilindros SCe', icono: 'Compacto', años: '2019 — 2026', servicios: 'Afinación • Suspensión • Frenos' },
  { nombre: 'KWID E-TECH', categoria: 'electrico', descripcion: '100% Eléctrico 65 HP', icono: 'EV', años: '2023 — 2026', servicios: 'Diagnóstico EV • Batería • Frenada' },
  { nombre: 'STEPWAY', categoria: 'crossover', descripcion: '1.6L K4M / HR16', icono: 'Crossover', años: '2010 — 2025', servicios: 'Banda de Tiempo • Suspensión • Frenos' },
  { nombre: 'SANDERO', categoria: 'hatchback', descripcion: '1.6L 8V, 16V / R.S. 2.0L', icono: 'Hatchback', años: '2010 — 2021', servicios: 'Afinación • Embrague • Frenos' },
  { nombre: 'LOGAN', categoria: 'sedan', descripcion: '1.6L K4M / HR16 Familiar', icono: 'Sedán', años: '2014 — 2025', servicios: 'Distribución • Afinación • Frenos' },
  { nombre: 'OROCH', categoria: 'trabajo', descripcion: '1.6L, 2.0L y Turbo 1.3L', icono: 'Pickup', años: '2018 — 2026', servicios: 'Embrague • Suspensión Carga • Frenos' },
  { nombre: 'KOLEOS', categoria: 'suv', descripcion: '2.5L CVT / 2.0L Turbo', icono: 'SUV Luxe', años: '2008 — 2026', servicios: 'Caja CVT • Escaneo • Frenos' },
  { nombre: 'KANGOO', categoria: 'trabajo', descripcion: '1.6L Carga y Pasajeros', icono: 'Utilitario', años: '2004 — 2026', servicios: 'Distribución • Afinación • Suspensión' },
  { nombre: 'KANGOO E-TECH', categoria: 'electrico', descripcion: 'Eléctrico Utilitario Pro', icono: 'EV Trabajo', años: 'Por confirmar', servicios: 'Escaneo Can Clip • Mantenimiento' },
  { nombre: 'KARDIAN', categoria: 'suv', descripcion: '1.0L Turbo TCe 3 Cil.', icono: 'Nuevo SUV', años: '2024 — 2026', servicios: 'Turbo TCe • Inyección • Calibración' },
  { nombre: 'ARKANA', categoria: 'electrico', descripcion: 'Micro-Híbrido Turbo 1.3L', icono: 'Híbrido', años: '2024 — 2026', servicios: 'Sistema Híbrido • Batería • Frenos' },
  { nombre: 'CLIO', categoria: 'hatchback', descripcion: '1.6L K4M y 2.0L Sport', icono: 'Clásico', años: '2001 — 2017', servicios: 'Kit Distribución • Frenos • Afinación' },
  { nombre: 'MEGANE', categoria: 'sedan', descripcion: 'I, II, Hatchback y Sedán', icono: 'Clásico', años: '2000 — 2010', servicios: 'Sistema Eléctrico • Banda • Frenos' },
  { nombre: 'FLUENCE', categoria: 'sedan', descripcion: '2.0L M4R / Caja CVT', icono: 'Sedán', años: '2010 — 2017', servicios: 'Transmisión CVT • Motor M4R • Frenos' },
  { nombre: 'SCENIC', categoria: 'crossover', descripcion: '1.6L / 2.0L Familiar', icono: 'Monovolumen', años: '2001 — 2009', servicios: 'Distribución • Confort • Frenos' },
  { nombre: 'PLATINA', categoria: 'sedan', descripcion: '1.6L K4M 16 Válvulas', icono: 'Económico', años: '2002 — 2010', servicios: 'Kit Distribución • Afinación • Frenos' }
]

const categorias = [
  { id: 'todos', nombre: 'Todos los Modelos' },
  { id: 'suv', nombre: 'SUVs y Crossovers' },
  { id: 'hatchback', nombre: 'Hatchbacks y Sedanes' },
  { id: 'trabajo', nombre: 'Utilitarios y Trabajo' },
  { id: 'electrico', nombre: 'Híbridos y Eléctricos' }
]

const vehiculosFiltrados = computed(() => {
  if (categoriaFiltro.value === 'todos') return catalogoVehiculos
  if (categoriaFiltro.value === 'hatchback') {
    return catalogoVehiculos.filter(v => v.categoria === 'hatchback' || v.categoria === 'sedan')
  }
  if (categoriaFiltro.value === 'suv') {
    return catalogoVehiculos.filter(v => v.categoria === 'suv' || v.categoria === 'crossover')
  }
  return catalogoVehiculos.filter(v => v.categoria === categoriaFiltro.value)
})

onMounted(async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      usuario.value = JSON.parse(userData)
    } catch (e) {
      usuario.value = null
    }
  }

  await nextTick()

  // Animaciones GSAP limpias y tolerantes a fallos
  gsapCtx = gsap.context(() => {
    // 1. Hero
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTl
      .from('.gsap-hero-badge', { opacity: 0, y: -20, duration: 0.7 })
      .from('.gsap-hero-title', { opacity: 0, y: 30, duration: 0.8 }, '-=0.4')
      .from('.gsap-hero-desc', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
      .from('.gsap-hero-cta', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 }, '-=0.4')
      .from('.gsap-hero-card', { opacity: 0, y: 35, scale: 0.97, duration: 0.8 }, '-=0.3')

    // Helper para animar entradas de sección sin riesgo de bloquear la opacidad
    const animarEntrada = (targets, triggerWrap) => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: triggerWrap,
            start: 'top 95%', // Se activa en cuanto asoma en el 95% de la ventana
            toggleActions: 'play none none none',
            once: true
          },
          clearProps: 'opacity,transform' // Limpia estilos en línea para garantizar visibilidad al 100%
        }
      )
    }

    // 2. Métricas
    animarEntrada('.gsap-metrica-card', '.gsap-metricas-wrap')

    // 3. Qué Hacemos (Pilares)
    animarEntrada('.gsap-pilar-card', '.gsap-pilares-wrap')

    // 4. Servicios
    animarEntrada('.gsap-servicio-card', '.gsap-servicios-wrap')

    // 5. Catálogo de Carros
    animarEntrada('.gsap-catalogo-wrap', '.gsap-catalogo-wrap')

    // 6. Contacto
    animarEntrada('.gsap-contacto-card', '.gsap-contacto-wrap')
  })

  // Listener de scroll para el botón Back to Top
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Recalcular offsets tras la renderización completa
  setTimeout(() => {
    ScrollTrigger.refresh()
  }, 200)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (gsapCtx) {
    gsapCtx.revert()
  }
})
</script>

<template>
  <div class="bg-zinc-950 text-zinc-100 min-h-screen relative isolate selection:bg-yellow-500 selection:text-black w-full max-w-full overflow-x-clip">
    <!-- Fondo tecnológico avanzado: Partículas doradas, blueprint, malla y paneles -->
    <TechBackground />

    <!-- ======================================================== -->
    <!-- HEADER GLASSMORPHISM                                     -->
    <!-- ======================================================== -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/90 border-b border-white/10 transition-colors">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        <!-- 1. Marca y Nombre del Sistema -->
        <a href="#" class="group flex items-center min-w-0 flex-1 md:flex-initial md:gap-3.5 focus:outline-none" aria-label="Inicio">
          <div class="size-10 sm:size-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 sm:size-6 fill-black">
              <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
            </svg>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center text-center px-2 min-w-0 md:flex-initial md:items-start md:text-left md:px-0">
            <span class="text-white font-extrabold tracking-tight text-sm sm:text-base leading-tight truncate">
              Servicio Mecánico<span class="hidden sm:inline"> Especializado</span>
            </span>
            <span class="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide truncate">Diagnóstico y Mantenimiento Automotriz</span>
          </div>
        </a>

        <!-- 2. Menú de navegación y Botón Iniciar Sesión alineados a la derecha -->
        <div class="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
          <nav class="flex items-center gap-1 lg:gap-2">
            <a 
              href="#que-hacemos" 
              class="h-10 px-3.5 inline-flex items-center justify-center text-sm font-medium text-zinc-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap leading-none"
            >
              Qué Hacemos
            </a>
            <a 
              href="#servicios" 
              class="h-10 px-3.5 inline-flex items-center justify-center text-sm font-medium text-zinc-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap leading-none"
            >
              Servicios
            </a>
            <a 
              href="#vehiculos" 
              class="h-10 px-3.5 inline-flex items-center justify-center text-sm font-medium text-zinc-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap leading-none"
            >
              Carros que Recibimos
            </a>
            <a 
              href="#contacto" 
              class="h-10 px-3.5 inline-flex items-center justify-center text-sm font-medium text-zinc-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap leading-none"
            >
              Contacto
            </a>
          </nav>

          <div class="h-5 w-px bg-white/10 mx-1"></div>

          <button
            @click="usuario ? irASeleccionTaller() : irALogin()"
            class="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 text-sm font-bold text-black hover:bg-yellow-400 transition-all shadow-md shadow-yellow-500/20 active:scale-[0.97] whitespace-nowrap shrink-0 leading-none"
          >
            <span>Iniciar Sesión</span>
            <ArrowRightIcon class="size-4" />
          </button>
        </div>

        <!-- Botón Móvil -->
        <div class="flex md:hidden shrink-0">
          <button
            type="button"
            class="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            @click="mobileMenuOpen = true"
            aria-label="Abrir menú"
          >
            <Bars3Icon class="size-5 sm:size-6" />
          </button>
        </div>
      </div>

      <!-- Drawer Móvil -->
      <Dialog as="div" class="md:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-zinc-900 p-6 shadow-2xl border-l border-white/10 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-6 border-b border-white/10">
              <span class="font-bold text-white text-sm tracking-wide">SERVICIO MECÁNICO</span>
              <button
                type="button"
                class="p-2 rounded-lg text-zinc-400 hover:text-white"
                @click="mobileMenuOpen = false"
              >
                <XMarkIcon class="size-6" />
              </button>
            </div>
            <div class="mt-6 flex flex-col gap-4 text-base font-medium text-zinc-200">
              <a href="#que-hacemos" @click="mobileMenuOpen = false" class="py-2 hover:text-yellow-400">Qué Hacemos</a>
              <a href="#servicios" @click="mobileMenuOpen = false" class="py-2 hover:text-yellow-400">Servicios</a>
              <a href="#vehiculos" @click="mobileMenuOpen = false" class="py-2 hover:text-yellow-400">Carros que Recibimos</a>
              <a href="#contacto" @click="mobileMenuOpen = false" class="py-2 hover:text-yellow-400">Contacto</a>
            </div>
          </div>

          <div class="pt-6 border-t border-white/10">
            <button
              @click="usuario ? irASeleccionTaller() : irALogin(); mobileMenuOpen = false"
              class="w-full py-3.5 rounded-xl bg-yellow-500 font-bold text-black text-center shadow-lg active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <span>Iniciar Sesión</span>
              <ArrowRightIcon class="size-4" />
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </header>

    <main>
      <!-- ======================================================== -->
      <!-- HERO SECTION: EXPERIENCIA + ESPECIALIZACIÓN              -->
      <!-- ======================================================== -->
      <section class="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto">
          <!-- Badge -->
          <div class="gsap-hero-badge inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs sm:text-sm font-semibold tracking-wide mb-6 max-w-full text-center leading-snug">
            <span class="size-2 rounded-full bg-yellow-400 animate-pulse shrink-0"></span>
            <span>Más de 15 Años de Experiencia Exclusiva en la Marca Renault</span>
          </div>

          <!-- Título Hero -->
          <h1 class="gsap-hero-title text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            El cuidado experto que tu <span class="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Renault</span> necesita.
          </h1>

          <!-- Descripción -->
          <p class="gsap-hero-desc mt-6 text-base sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Somos el taller mecánico independiente líder enfocado al 100% en vehículos Renault. Diagnóstico por escáner computarizado original, refacciones certificadas y total transparencia en cada reparación.
          </p>

          <!-- CTAs -->
          <div class="gsap-hero-cta mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contacto"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-yellow-500 px-8 py-4 text-base font-bold text-black hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/25 active:scale-[0.97]"
            >
              <span>Agendar Mi Servicio</span>
              <ArrowRightIcon class="size-5" />
            </a>
            <a
              href="#servicios"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-7 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors active:scale-[0.97]"
            >
              <span>Ver Servicios Disponibles</span>
            </a>
          </div>
        </div>

        <!-- TARJETA VISUAL DE LA REVISIÓN DEL TALLER -->
        <div class="gsap-hero-card mt-14 sm:mt-18 max-w-4xl mx-auto">
          <div class="relative rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div class="flex items-center gap-3">
                <div class="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <ShieldCheckIcon class="size-7" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">Recepción y Servicio Garantizado</h3>
                  <p class="text-xs text-zinc-400">Inspección de seguridad en 25 puntos clave de tu automóvil</p>
                </div>
              </div>
              <div class="flex items-center gap-1 text-xs text-yellow-400 font-semibold px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <StarIcon class="size-4" /> Calificación 4.9/5 por clientes
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div class="text-yellow-400 font-bold mb-1">✓ Escaneo de Motor</div>
                <div class="text-zinc-400">Detección de códigos de falla y borrado de testigos en tablero.</div>
              </div>
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div class="text-yellow-400 font-bold mb-1">✓ Fluidos y Filtros</div>
                <div class="text-zinc-400">Uso estricto de especificaciones recomendadas por el fabricante.</div>
              </div>
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div class="text-yellow-400 font-bold mb-1">✓ Hoja Digital Oficial</div>
                <div class="text-zinc-400">Nota con desglose de mano de obra y garantía documentada.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- BANDA DE MÉTRICAS (+15 AÑOS)                             -->
      <!-- ======================================================== -->
      <section class="gsap-metricas-wrap py-12 border-y border-white/10 bg-zinc-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div
              v-for="metrica in metricas"
              :key="metrica.etiqueta"
              class="gsap-metrica-card p-5 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between"
            >
              <div class="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                {{ metrica.valor }} <span class="text-xl sm:text-2xl text-yellow-400 font-sans">{{ metrica.sufijo }}</span>
              </div>
              <div class="mt-2 text-sm font-bold text-zinc-200">{{ metrica.etiqueta }}</div>
              <div class="text-xs text-zinc-400 mt-0.5">{{ metrica.detalle }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- QUÉ HACEMOS (NUESTRA METODOLOGÍA)                        -->
      <!-- ======================================================== -->
      <section id="que-hacemos" class="gsap-pilares-wrap py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-xs sm:text-sm font-bold tracking-widest text-yellow-400 uppercase">Nuestra Especialidad</h2>
          <p class="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            ¿Qué es lo que hacemos?
          </p>
          <p class="mt-4 text-zinc-400 text-sm sm:text-base">
            No somos un taller genérico. Dedicamos todos nuestros recursos, herramienta y experiencia exclusivamente al ecosistema automotriz Renault.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="pilar in pilares"
            :key="pilar.titulo"
            class="gsap-pilar-card relative rounded-3xl p-8 bg-zinc-900/60 border border-white/10 hover:border-yellow-500/40 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div class="size-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6">
                <component :is="pilar.icono" class="size-7" />
              </div>
              <h3 class="text-xl font-bold text-white mb-3">{{ pilar.titulo }}</h3>
              <p class="text-sm text-zinc-400 leading-relaxed">{{ pilar.descripcion }}</p>
            </div>
            <div class="mt-8 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-yellow-400 gap-1.5">
              <CheckCircleIcon class="size-4" /> Estándar Renault Certificado
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SERVICIOS QUE OFRECEMOS                                  -->
      <!-- ======================================================== -->
      <section id="servicios" class="gsap-servicios-wrap py-24 sm:py-32 border-t border-white/10 bg-zinc-900/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-xs sm:text-sm font-bold tracking-widest text-yellow-400 uppercase">Catálogo de Servicios</h2>
            <p class="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Mecánica integral para tu automóvil
            </p>
            <p class="mt-4 text-zinc-400 text-sm sm:text-base">
              Desde servicios de rutina hasta reparaciones mayores de tren motriz con mano de obra calificada.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="servicio in servicios"
              :key="servicio.nombre"
              class="gsap-servicio-card group rounded-2xl p-6 sm:p-7 bg-zinc-950/80 border border-white/10 hover:border-yellow-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-bold text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                    {{ servicio.badge }}
                  </span>
                  <WrenchScrewdriverIcon class="size-5 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
                </div>
                <h3 class="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {{ servicio.nombre }}
                </h3>
                <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {{ servicio.descripcion }}
                </p>
              </div>

              <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span class="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircleIcon class="size-4" /> Garantizado
                </span>
                <a href="#contacto" class="text-white hover:text-yellow-400 transition-colors font-medium">
                  Cotizar &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- CARROS QUE RECIBIMOS (CATÁLOGO RENAULT)                  -->
      <!-- ======================================================== -->
      <section id="vehiculos" class="gsap-catalogo-wrap py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-xs sm:text-sm font-bold tracking-widest text-yellow-400 uppercase">Gama Atendida</h2>
          <p class="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Vehículos Renault que recibimos
          </p>
          <p class="mt-4 text-zinc-400 text-sm sm:text-base">
            Contamos con especificaciones técnicas, torques de apriete y diagramas eléctricos para todos estos modelos:
          </p>
        </div>

        <!-- Filtros por categoría -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            v-for="cat in categorias"
            :key="cat.id"
            @click="categoriaFiltro = cat.id"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
            :class="categoriaFiltro === cat.id ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/5'"
          >
            {{ cat.nombre }}
          </button>
        </div>

        <!-- Grid de Modelos -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          <div
            v-for="auto in vehiculosFiltrados"
            :key="auto.nombre"
            class="p-3.5 sm:p-5 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-yellow-500/40 hover:bg-zinc-900/90 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-yellow-500/5 hover:-translate-y-0.5"
          >
            <div>
              <!-- Fila superior: Categoría y Años con badges claros y anti-colisión -->
              <div class="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                  {{ auto.icono }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/25 text-[10px] sm:text-[11px] font-mono font-bold text-yellow-400 shrink-0 whitespace-nowrap">
                  {{ auto.años }}
                </span>
              </div>

              <!-- Nombre del Modelo -->
              <h4 class="text-base sm:text-lg font-extrabold text-white group-hover:text-yellow-400 transition-colors">
                {{ auto.nombre }}
              </h4>

              <!-- Motorización y Detalles Técnicos -->
              <p class="text-[11px] sm:text-xs text-zinc-400 mt-1 line-clamp-1">
                {{ auto.descripcion }}
              </p>
            </div>

            <!-- Servicios frecuentes y botón directo a WhatsApp -->
            <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 gap-2">
              <span class="truncate text-[10px] sm:text-[11px] text-zinc-500 font-medium">
                {{ auto.servicios }}
              </span>
              <a
                :href="`https://wa.me/525522433546?text=${encodeURIComponent('Hola, me gustaría cotizar un servicio para mi Renault ' + auto.nombre + ' (' + auto.años + ').')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 text-yellow-400 hover:text-yellow-300 font-semibold inline-flex items-center gap-0.5 text-[11px] active:scale-95 transition-all"
                title="Cotizar este modelo por WhatsApp"
              >
                <span>Cotizar</span>
                <ArrowRightIcon class="size-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div class="mt-10 text-center text-xs sm:text-sm text-zinc-400">
          ¿Tienes un modelo no listado o una edición especial?
          <a
            href="https://wa.me/525522433546?text=Hola,%20tengo%20un%20auto%20Renault%20y%20quisiera%20consultar%20sobre%20un%20servicio%20especial."
            target="_blank"
            rel="noopener noreferrer"
            class="text-yellow-400 font-bold hover:underline ml-1"
          >
            Pregúntanos por WhatsApp
          </a>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SECCIÓN DE CONTACTO Y UBICACIÓN                          -->
      <!-- ======================================================== -->
      <section id="contacto" class="gsap-contacto-wrap py-24 sm:py-32 border-t border-white/10 bg-zinc-900/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-xs sm:text-sm font-bold tracking-widest text-yellow-400 uppercase">Visítanos o Llámanos</h2>
            <p class="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Contacto directo con el taller
            </p>
            <p class="mt-4 text-zinc-400 text-sm sm:text-base">
              Agenda tu cita de revisión o aclara dudas técnicas con nuestros mecánicos especialistas.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <!-- Columna Izquierda: Información Directa -->
            <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div class="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-xl space-y-6">
                <div class="flex items-start gap-4">
                  <div class="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                    <MapPinIcon class="size-6" />
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-white">Dirección del Taller</h4>
                    <p class="text-sm text-zinc-300 mt-1 leading-relaxed">
                      Avenida Talismán 3603, Col. Gertrudis Sánchez 1ra Sección, Alcaldía Gustavo A. Madero, C.P. 07460, CDMX.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                    <PhoneIcon class="size-6" />
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-white">Teléfono de Atención</h4>
                    <p class="text-sm text-zinc-300 mt-1">
                      Llamadas y atención rápida:
                    </p>
                    <a href="tel:5522433546" class="text-lg font-mono font-bold text-yellow-400 hover:underline">
                      (55) 2243-3546
                    </a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                    <ClockIcon class="size-6" />
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-white">Horarios de Servicio</h4>
                    <div class="text-sm text-zinc-300 mt-1 space-y-0.5">
                      <div>Lunes a Viernes: <span class="text-white font-semibold">8:00 AM – 6:00 PM</span></div>
                      <div>Sábados: <span class="text-white font-semibold">8:00 AM – 2:00 PM</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción Rápida -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="tel:5522433546"
                  class="flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-bold text-black hover:bg-yellow-400 transition-all shadow-lg active:scale-[0.97]"
                >
                  <PhoneIcon class="size-5" />
                  <span>Llamar Ahora</span>
                </a>
                <button
                  @click="irAContacto"
                  class="flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 border border-white/10 px-6 py-4 font-bold text-white hover:bg-zinc-700 transition-colors active:scale-[0.97]"
                >
                  <DocumentTextIcon class="size-5" />
                  <span>Formulario Online</span>
                </button>
              </div>
            </div>

            <!-- Columna Derecha: Tarjeta de Compromiso y Mapa/Cita -->
            <div class="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-zinc-950/80 border border-yellow-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div class="absolute -right-20 -top-20 size-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-yellow-400 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                  Garantía y Confianza
                </span>
                <h3 class="mt-6 text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Tu auto en manos de verdaderos especialistas
                </h3>
                <p class="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
                  Con más de una década y media resolviendo fallas complejas y afinando motores Renault, garantizamos cada pieza y trabajo con honestidad absoluta.
                </p>

                <div class="mt-8 space-y-3">
                  <div class="flex items-center gap-3 text-sm text-zinc-200">
                    <CheckCircleIcon class="size-5 text-emerald-400 shrink-0" />
                    <span>Sin cobros fantasma: cada presupuesto se autoriza previamente por ti.</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-zinc-200">
                    <CheckCircleIcon class="size-5 text-emerald-400 shrink-0" />
                    <span>Entrega puntual en tiempo y forma acordados.</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-zinc-200">
                    <CheckCircleIcon class="size-5 text-emerald-400 shrink-0" />
                    <span>Hoja de inspección digital detallada con registro fotográfico.</span>
                  </div>
                </div>
              </div>

              <div class="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-xs text-zinc-400 text-center sm:text-left">
                  ¿Necesitas generar una nota o eres colaborador del taller?
                </div>
                <button
                  v-if="usuario"
                  @click="irASeleccionTaller"
                  class="text-xs font-bold text-yellow-400 hover:underline"
                >
                  Acceder a la plataforma interna &rarr;
                </button>
                <button
                  v-else
                  @click="irALogin"
                  class="text-xs font-bold text-zinc-400 hover:text-yellow-400 transition-colors"
                >
                  Acceso a colaboradores &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ======================================================== -->
    <!-- FOOTER LIMPIO                                            -->
    <!-- ======================================================== -->
    <footer class="border-t border-white/10 bg-black pt-12 pb-[calc(2rem+env(safe-area-inset-bottom))] text-xs text-zinc-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div class="flex items-center gap-3">
          <div class="size-7 rounded-lg bg-yellow-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-4 fill-black">
              <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
            </svg>
          </div>
          <div>
            <span class="font-bold text-white">SERVICIO MECÁNICO ESPECIALIZADO</span> &bull; +15 Años de Experiencia
          </div>
        </div>

        <div>
          © {{ new Date().getFullYear() }} Taller Especializado Renault. Todos los derechos reservados.
        </div>

        <div class="flex items-center gap-4 text-zinc-400">
          <a href="tel:5522433546" class="hover:text-yellow-400 transition-colors">Tel: (55) 2243-3546</a>
          <span>&bull;</span>
          <button @click="irAContacto" class="hover:text-yellow-400 transition-colors">Contacto</button>
          <span>&bull;</span>
          <button @click="irALogin" class="hover:text-yellow-400 transition-colors">Portal</button>
        </div>
      </div>
    </footer>

    <!-- ======================================================== -->
    <!-- BOTÓN FLOTANTE BACK TO TOP                               -->
    <!-- ======================================================== -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-90 translate-y-3"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-90 translate-y-3"
    >
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 size-11 sm:size-12 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-yellow-400 border border-yellow-500/30 hover:border-yellow-400 shadow-2xl shadow-yellow-500/10 backdrop-blur-md flex items-center justify-center cursor-pointer group active:scale-[0.92] transition-all duration-200 select-none"
        aria-label="Volver arriba"
        title="Volver arriba"
      >
        <ArrowUpIcon class="size-5 sm:size-6 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform duration-200" />
      </button>
    </transition>
  </div>
</template>

<style scoped>
* {
  -webkit-tap-highlight-color: transparent;
}

html {
  scroll-behavior: smooth;
}
</style>
