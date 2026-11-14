<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  FolderIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL
const router = useRouter()

// Estado
const notasGuardadas = ref([])
const cargando = ref(false)
const error = ref('')
const terminoBusqueda = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 8
const rolUsuario = ref('')

// Filtro por taller
const filtroTaller = ref('Todos')

const esSuperAdmin = computed(() => rolUsuario.value === 'superadmin')
const esAdmin = computed(() => rolUsuario.value === 'admin' || rolUsuario.value === 'superadmin')

// Filtrado reactivo de notas
const notasFiltradas = computed(() => {
  let filtered = notasGuardadas.value

  // Filtro por búsqueda
  if (terminoBusqueda.value.trim()) {
    const term = terminoBusqueda.value.toLowerCase().trim()
    filtered = filtered.filter(nota =>
      (nota.cliente?.nombre && nota.cliente.nombre.toLowerCase().includes(term)) ||
      (nota.cliente?.vehiculo && nota.cliente.vehiculo.toLowerCase().includes(term)) ||
      (nota.cliente?.modelo && nota.cliente.modelo.toLowerCase().includes(term)) ||
      (nota.cliente?.placas && nota.cliente.placas.toLowerCase().includes(term)) ||
      (nota.cliente?.servicio && nota.cliente.servicio.toLowerCase().includes(term)) ||
      (nota._id && nota._id.toLowerCase().includes(term))
    )
  }

  // Filtro por taller
  if (filtroTaller.value !== 'Todos') {
    filtered = filtered.filter(nota => {
      const t = (nota.taller || '').toLowerCase()
      return t.includes(filtroTaller.value.toLowerCase())
    })
  }

  return filtered
})

const totalPaginas = computed(() => {
  return Math.ceil(notasFiltradas.value.length / itemsPorPagina) || 1
})

const notasPaginadas = computed(() => {
  const startIndex = (paginaActual.value - 1) * itemsPorPagina
  const endIndex = startIndex + itemsPorPagina
  return notasFiltradas.value.slice(startIndex, endIndex)
})

const paginas = computed(() => {
  const pages = []
  const total = totalPaginas.value
  const current = paginaActual.value
  const maxPages = 5
  let start = Math.max(1, current - Math.floor(maxPages / 2))
  let end = Math.min(total, start + maxPages - 1)

  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor || 0)
}

// Control financiero: Total de dinero acumulado
const totalDineroGenerado = computed(() => {
  return notasGuardadas.value.reduce((acc, nota) => acc + (Number(nota.total) || 0), 0)
})

const totalDineroFiltrado = computed(() => {
  return notasFiltradas.value.reduce((acc, nota) => acc + (Number(nota.total) || 0), 0)
})

const totalDineroActual = computed(() => {
  if (filtroTaller.value !== 'Todos' || (terminoBusqueda.value && terminoBusqueda.value.trim())) {
    return totalDineroFiltrado.value
  }
  return totalDineroGenerado.value
})

const cargarNotas = async () => {
  try {
    cargando.value = true
    error.value = ''

    const token = localStorage.getItem('authToken')
    if (!token) {
      error.value = 'No se encontró sesión activa. Por favor, inicia sesión.'
      return
    }

    const response = await axios.get(`${API}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    notasGuardadas.value = response.data || []
  } catch (err) {
    console.error('Error cargando notas:', err)
    if (err.response?.status === 401 || err.response?.status === 403) {
      error.value = 'Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.'
    } else {
      error.value = 'Error al cargar las notas. Intenta nuevamente.'
    }
  } finally {
    cargando.value = false
  }
}

const verPDF = (nota) => {
  if (nota.pdfPath) {
    const url = `${API.replace(/\/api$/, '')}${nota.pdfPath.startsWith('/') ? '' : '/'}${nota.pdfPath}`
    window.open(url, '_blank')
    return
  }
  // Fallback con token
  const token = localStorage.getItem('authToken')
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
  window.open(`${API}/notes/${nota._id}/descargar${tokenParam}`, '_blank')
}

const descargarPDF = async (notaId, nombreCliente) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      Swal.fire({
        title: 'Sesión requerida',
        text: 'Inicia sesión para descargar el archivo.',
        icon: 'warning',
        confirmButtonColor: '#eab308',
        background: '#18181b',
        color: '#ffffff'
      })
      return
    }

    const response = await axios.get(`${API}/notes/${notaId}/descargar`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = (nombreCliente || 'servicio').trim().replace(/\s+/g, '_')
    link.setAttribute('download', `nota_${safeName}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Error descargando PDF:', error)
    Swal.fire({
      title: 'Error de descarga',
      text: 'No se pudo descargar el archivo PDF.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  }
}

// Navegar a modo edición
const editarNota = (nota) => {
  const tallerSlug = (nota.taller || 'talisman').toLowerCase().includes('lutecia') ? 'lutecia' : 'talisman'
  router.push({
    path: `/taller/${tallerSlug}`,
    query: { editar: nota._id }
  })
}

const eliminarNota = async (id) => {
  const result = await Swal.fire({
    title: 'Confirmar eliminación',
    text: '¿Estás seguro de eliminar esta nota de servicio? Esta acción retirará el registro y su archivo PDF.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#27272a',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#18181b',
    color: '#ffffff'
  })

  if (!result.isConfirmed) return

  try {
    const token = localStorage.getItem('authToken')
    await axios.delete(`${API}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    Swal.fire({
      title: 'Nota eliminada',
      text: 'La orden fue retirada exitosamente.',
      icon: 'success',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })

    await cargarNotas()
  } catch (err) {
    console.error('Error eliminando nota:', err)
    Swal.fire({
      title: 'Error',
      text: err.response?.data?.msg || 'Error al eliminar la nota.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  }
}

const tieneGarantiaActiva = (nota) => {
  if (nota.tieneGarantia === false) return false
  if (nota.tieneGarantia === true) return true
  if (!nota.garantia) return false
  const g = nota.garantia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  return g !== '' && !g.includes('sin garantia') && !g.includes('no especificada') && g !== '0'
}

watch([terminoBusqueda, filtroTaller], () => {
  paginaActual.value = 1
})

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      rolUsuario.value = JSON.parse(userData).rol || ''
    } catch (e) {
      rolUsuario.value = ''
    }
  }
  cargarNotas()
})
</script>

<template>
  <div class="min-h-screen text-zinc-100 relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <TechBackground />

    <main class="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14 py-6 sm:py-8 flex-1">
      <!-- CABECERA PRINCIPAL -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-white/10">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold mb-2">
            <ClipboardDocumentListIcon class="size-4" />
            <span>Control de Órdenes y Presupuestos Oficiales</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Historial de Notas de Servicio
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Consulta, edición de precios y datos, descarga de comprobantes y gestión técnica de servicios
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Apartado de Control Financiero y Órdenes -->
          <div class="px-4 py-2 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-4 shadow-xl">
            <!-- Total Generado en Dinero -->
            <div class="flex items-center gap-2.5">
              <div class="size-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                <BanknotesIcon class="size-4" />
              </div>
              <div>
                <span class="text-[9px] font-mono font-bold text-zinc-400 block uppercase tracking-wider">
                  {{ (filtroTaller !== 'Todos' || (terminoBusqueda && terminoBusqueda.trim())) ? 'Monto Filtrado' : 'Total Generado' }}
                </span>
                <span class="text-sm sm:text-base font-extrabold text-yellow-400 font-mono tracking-tight leading-tight">
                  {{ formatoMoneda(totalDineroActual) }}
                </span>
              </div>
            </div>

            <!-- Separador -->
            <div class="h-7 w-px bg-white/10"></div>

            <!-- Cantidad de Notas -->
            <div>
              <span class="text-[9px] font-mono font-bold text-zinc-500 block uppercase tracking-wider">Órdenes</span>
              <span class="text-xs sm:text-sm font-extrabold text-white font-mono leading-tight">
                {{ notasFiltradas.length }}
                <span v-if="notasFiltradas.length !== notasGuardadas.length" class="text-zinc-500 text-[10px]">/ {{ notasGuardadas.length }}</span>
                <span class="text-zinc-400 text-[10px] font-sans font-normal ml-0.5">notas</span>
              </span>
            </div>
          </div>

          <!-- Acceso al Gestor de Archivos -->
          <button
            type="button"
            @click="router.push('/archivos')"
            class="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            title="Ir al Gestor de Archivos por Año y Mes"
          >
            <FolderIcon class="size-4 text-yellow-400" />
            <span>Gestor de Archivos</span>
          </button>

          <!-- Botón Nueva Nota -->
          <button
            type="button"
            @click="router.push('/seleccion-taller')"
            class="px-4 py-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <PlusIcon class="size-4" />
            <span>Nueva Nota</span>
          </button>

          <!-- Botón Recargar -->
          <button
            type="button"
            @click="cargarNotas"
            :disabled="cargando"
            class="size-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-yellow-400 flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="Recargar listado"
          >
            <ArrowPathIcon :class="['size-5', cargando ? 'animate-spin text-yellow-400' : '']" />
          </button>
        </div>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS POR TALLER -->
      <section class="space-y-4 mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl">
          <!-- Píldoras de Filtro de Taller -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1.5">
              <BuildingStorefrontIcon class="size-4 text-yellow-400" />
              <span>Sucursal:</span>
            </span>

            <button
              type="button"
              @click="filtroTaller = 'Todos'"
              :class="[
                filtroTaller === 'Todos'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-950/70 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/5 font-semibold',
                'px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              Todos los talleres
            </button>

            <button
              type="button"
              @click="filtroTaller = 'Talisman'"
              :class="[
                filtroTaller === 'Talisman'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-950/70 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/5 font-semibold',
                'px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              Taller Talismán
            </button>

            <button
              type="button"
              @click="filtroTaller = 'Lutecia'"
              :class="[
                filtroTaller === 'Lutecia'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/20'
                  : 'bg-zinc-950/70 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/5 font-semibold',
                'px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              Taller Lutecia
            </button>
          </div>

          <!-- Buscador -->
          <div class="relative w-full md:w-96">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              v-model="terminoBusqueda"
              type="text"
              placeholder="Buscar por cliente, placas, vehículo o folio..."
              class="w-full rounded-2xl bg-zinc-950/80 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      <!-- LISTADO DE NOTAS -->
      <section>
        <!-- Estado de Carga -->
        <div v-if="cargando" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <ArrowPathIcon class="size-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p class="text-sm font-semibold text-zinc-300">Cargando historial de notas...</p>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="p-8 text-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p class="text-sm font-bold">{{ error }}</p>
          <button
            @click="cargarNotas"
            class="mt-3 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="notasFiltradas.length === 0" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <ClipboardDocumentListIcon class="size-12 text-zinc-600 mx-auto mb-3" />
          <h3 class="text-base font-bold text-white">No se encontraron notas registradas</h3>
          <p class="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            Intenta con otro término de búsqueda o selecciona otra sucursal.
          </p>
        </div>

        <!-- Lista de Tarjetas de Notas -->
        <div v-else class="space-y-4">
          <div
            v-for="nota in notasPaginadas"
            :key="nota._id"
            class="rounded-3xl p-5 sm:p-6 bg-zinc-900/80 border border-white/10 hover:border-yellow-500/40 transition-all duration-200 shadow-xl backdrop-blur-xl group relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <!-- Borde superior luminoso activo al hover -->
            <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>

            <!-- Columna Izquierda: Datos del Cliente, Vehículo y Servicio -->
            <div class="flex-1 min-w-0 space-y-3">
              <!-- Encabezado de la Tarjeta: Nombre + Sucursal + Folio -->
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-base sm:text-lg font-extrabold text-white group-hover:text-yellow-400 transition-colors truncate">
                  {{ nota.cliente?.nombre || 'Cliente sin nombre' }}
                </h3>

                <!-- Badge de Sucursal -->
                <span
                  :class="[
                    (nota.taller || '').toLowerCase().includes('lutecia')
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0'
                  ]"
                >
                  {{ nota.taller }}
                </span>

                <!-- Folio -->
                <span class="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-950/70 border border-white/5 shrink-0">
                  Folio: #{{ nota._id ? nota._id.toString().slice(-6) : '000000' }}
                </span>
              </div>

              <!-- Ficha Técnica: Vehículo, Modelo, Placas, Servicio, Fecha -->
              <div class="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-zinc-300">
                <!-- Vehículo -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/70 border border-white/5">
                  <TruckIcon class="size-4 text-yellow-400 shrink-0" />
                  <strong class="text-white">{{ nota.cliente?.vehiculo || 'Renault' }}</strong>
                  <span v-if="nota.cliente?.modelo" class="text-zinc-400 font-mono">({{ nota.cliente.modelo }})</span>
                </span>

                <!-- Placas -->
                <span v-if="nota.cliente?.placas" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/70 border border-white/5 font-mono font-semibold">
                  <IdentificationIcon class="size-4 text-zinc-400 shrink-0" />
                  <span>{{ nota.cliente.placas }}</span>
                </span>

                <!-- Servicio Principal -->
                <span v-if="nota.cliente?.servicio" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/70 border border-white/5">
                  <WrenchScrewdriverIcon class="size-4 text-yellow-400 shrink-0" />
                  <span class="truncate max-w-[220px]">{{ nota.cliente.servicio }}</span>
                </span>

                <!-- Fecha -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/70 border border-white/5 font-mono text-zinc-400">
                  <CalendarDaysIcon class="size-4 text-zinc-500 shrink-0" />
                  <span>{{ new Date(nota.fecha || nota.createdAt).toLocaleDateString('es-MX') }}</span>
                </span>

                <!-- Daños Marcados -->
                <span v-if="nota.daños && nota.daños.length > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[11px] font-semibold">
                  <EyeIcon class="size-3.5" />
                  <span>{{ nota.daños.length }} daños marcados</span>
                </span>

                <!-- Garantía -->
                <span v-if="tieneGarantiaActiva(nota)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                  <ShieldCheckIcon class="size-3.5" />
                  <span>{{ nota.garantia }}</span>
                </span>

                <!-- Trazabilidad: Creado por (Visible únicamente para Superadmin y Admin) -->
                <span
                  v-if="esAdmin && (nota.creadoPor?.nombre || nota.creadoPor?.correo)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-[11px] font-medium"
                  title="Usuario que generó esta nota"
                >
                  <UserIcon class="size-3.5 text-blue-400 shrink-0" />
                  <span>Generado por: <strong class="text-white">{{ nota.creadoPor?.nombre || 'Personal del Taller' }}</strong> <span class="text-blue-400 text-[10px] font-mono">({{ nota.creadoPor?.rol === 'superadmin' ? 'Superadmin' : (nota.creadoPor?.rol === 'admin' ? 'Admin' : 'Técnico') }})</span></span>
                </span>

                <!-- Trazabilidad: Editado por (Visible únicamente para Superadmin y Admin si hubo cambios) -->
                <span
                  v-if="esAdmin && (nota.fueEditada || nota.editadoPor?.nombre)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium"
                  title="Última modificación registrada"
                >
                  <PencilSquareIcon class="size-3.5 text-amber-400 shrink-0" />
                  <span>Modificado por: <strong class="text-white">{{ nota.editadoPor?.nombre || 'Personal del Taller' }}</strong> <span v-if="nota.editadoPor?.fecha" class="text-amber-400 text-[10px] font-mono">({{ new Date(nota.editadoPor.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }})</span></span>
                </span>
              </div>
            </div>

            <!-- Columna Derecha: Importe Total y Botones de Acción -->
            <div class="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 shrink-0">
              <div class="text-left sm:text-right lg:text-right">
                <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Importe Total</span>
                <span class="text-2xl font-extrabold text-yellow-400 font-mono tracking-tight">
                  {{ formatoMoneda(nota.total) }}
                </span>
              </div>

              <!-- Botones de Acción -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- BOTÓN EDITAR NOTA (NUEVA CAPACIDAD SOLICITADA) -->
                <button
                  type="button"
                  @click="editarNota(nota)"
                  class="px-3.5 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Editar precios, partidas o datos de esta nota"
                >
                  <PencilSquareIcon class="size-4" />
                  <span>Editar Nota</span>
                </button>

                <!-- BOTÓN VER PDF -->
                <button
                  type="button"
                  @click="verPDF(nota)"
                  class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ver PDF oficial en pestaña nueva"
                >
                  <EyeIcon class="size-4" />
                  <span>Ver PDF</span>
                </button>

                <!-- BOTÓN DESCARGAR PDF -->
                <button
                  type="button"
                  @click="descargarPDF(nota._id, nota.cliente?.nombre)"
                  class="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Descargar comprobante PDF oficial"
                >
                  <ArrowDownTrayIcon class="size-4" />
                  <span>Descargar</span>
                </button>

                <!-- BOTÓN ELIMINAR (ADMIN) -->
                <button
                  v-if="esAdmin"
                  type="button"
                  @click="eliminarNota(nota._id)"
                  class="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer"
                  title="Eliminar nota definitivamente"
                >
                  <TrashIcon class="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINACIÓN MODERNA -->
        <div v-if="totalPaginas > 1" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <div class="text-xs text-zinc-400">
            Mostrando
            <strong class="text-white">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</strong>
            a
            <strong class="text-white">{{ Math.min(paginaActual * itemsPorPagina, notasFiltradas.length) }}</strong>
            de
            <strong class="text-yellow-400 font-mono">{{ notasFiltradas.length }}</strong>
            notas encontradas
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="size-9 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-yellow-500/40 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeftIcon class="size-4" />
            </button>

            <button
              v-for="p in paginas"
              :key="p"
              type="button"
              @click="paginaActual = p"
              :class="[
                paginaActual === p
                  ? 'bg-yellow-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/10',
                'size-9 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer'
              ]"
            >
              {{ p }}
            </button>

            <button
              type="button"
              @click="paginaActual++"
              :disabled="paginaActual >= totalPaginas"
              class="size-9 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-yellow-500/40 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRightIcon class="size-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
