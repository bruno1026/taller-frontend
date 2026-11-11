<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL

const cargando = ref(false)
const error = ref('')
const yearsData = ref([])
const totalArchivos = ref(0)
const totalFormatted = ref('0 B')

const selectedYear = ref('')
const selectedMonth = ref('')
const terminoBusqueda = ref('')
const rolUsuario = ref('')

const esAdmin = computed(() => rolUsuario.value === 'admin' || rolUsuario.value === 'superadmin')
const esSuperadmin = computed(() => rolUsuario.value === 'superadmin')

const descargandoZip = ref(false)
const limpiandoBase = ref(false)

const cargarArbolArchivos = async () => {
  try {
    cargando.value = true
    error.value = ''

    const token = localStorage.getItem('authToken')
    if (!token) {
      error.value = 'No se encontró sesión activa. Por favor inicia sesión.'
      return
    }

    const res = await axios.get(`${API}/files/tree`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.data.ok) {
      yearsData.value = res.data.years || []
      totalArchivos.value = res.data.totalArchivos || 0
      totalFormatted.value = res.data.totalFormatted || '0 B'

      // Seleccionar el año más reciente si no hay año seleccionado
      if (!selectedYear.value && yearsData.value.length > 0) {
        selectedYear.value = yearsData.value[0].year
      }
    }
  } catch (err) {
    console.error('Error al cargar gestor de archivos:', err)
    error.value = err.response?.data?.msg || 'Error al conectar con el servidor de archivos'
  } finally {
    cargando.value = false
  }
}

// Lista de meses disponibles para el año seleccionado
const mesesDisponibles = computed(() => {
  if (!selectedYear.value) return []
  const y = yearsData.value.find(item => item.year === selectedYear.value)
  return y ? y.months : []
})

// Todos los archivos aplanados según filtros
const archivosFiltrados = computed(() => {
  let list = []

  for (const y of yearsData.value) {
    if (selectedYear.value && y.year !== selectedYear.value) continue

    for (const m of y.months) {
      if (selectedMonth.value && m.month !== selectedMonth.value) continue

      for (const f of m.files) {
        list.push({
          ...f,
          year: y.year,
          monthName: m.mesLabel
        })
      }
    }
  }

  // Filtro por término de búsqueda
  if (terminoBusqueda.value.trim()) {
    const term = terminoBusqueda.value.toLowerCase().trim()
    list = list.filter(f =>
      (f.cliente && f.cliente.toLowerCase().includes(term)) ||
      (f.vehiculo && f.vehiculo.toLowerCase().includes(term)) ||
      (f.placas && f.placas.toLowerCase().includes(term)) ||
      (f.taller && f.taller.toLowerCase().includes(term)) ||
      (f.filename && f.filename.toLowerCase().includes(term)) ||
      (f.relativePath && f.relativePath.toLowerCase().includes(term))
    )
  }

  return list
})

const seleccionarYear = (year) => {
  selectedYear.value = year
  selectedMonth.value = ''
}

const seleccionarMonth = (month) => {
  selectedMonth.value = selectedMonth.value === month ? '' : month
}

const verArchivo = (relativePath) => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    Swal.fire({
      title: 'Sesión requerida',
      text: 'Inicia sesión para visualizar el archivo.',
      icon: 'warning',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
    return
  }
  const tokenParam = `&token=${encodeURIComponent(token)}`
  const url = `${API}/files/view?path=${encodeURIComponent(relativePath)}${tokenParam}`
  window.open(url, '_blank')
}

const descargarArchivo = async (relativePath, nombreSugerido) => {
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

    const res = await axios.get(`${API}/files/download`, {
      params: { path: relativePath },
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })

    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', nombreSugerido || 'nota_servicio.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  } catch (err) {
    console.error('Error al descargar archivo:', err)
    Swal.fire({
      title: 'Error de Descarga',
      text: 'No se pudo descargar el archivo solicitado.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  }
}

const eliminarArchivo = async (relativePath, filename) => {
  const result = await Swal.fire({
    title: 'Confirmar Eliminación',
    text: `¿Deseas eliminar permanentemente el archivo ${filename}? Esta acción liberará el espacio en disco.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#27272a',
    confirmButtonText: 'Sí, eliminar archivo',
    cancelButtonText: 'Cancelar',
    background: '#18181b',
    color: '#ffffff'
  })

  if (!result.isConfirmed) return

  try {
    const token = localStorage.getItem('authToken')
    await axios.delete(`${API}/files`, {
      params: { path: relativePath },
      headers: { Authorization: `Bearer ${token}` }
    })

    Swal.fire({
      title: 'Archivo Eliminado',
      text: `El documento fue retirado del almacenamiento.`,
      icon: 'success',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })

    await cargarArbolArchivos()
  } catch (err) {
    console.error('Error al eliminar archivo:', err)
    Swal.fire({
      title: 'Error al Eliminar',
      text: err.response?.data?.msg || 'No se pudo eliminar el archivo.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  }
}

const descargarRespaldoZip = async () => {
  try {
    descargandoZip.value = true
    const token = localStorage.getItem('authToken')
    if (!token) {
      Swal.fire({
        title: 'Sesion Requerida',
        text: 'Inicia sesion para descargar el archivo de respaldo.',
        icon: 'warning',
        confirmButtonColor: '#eab308',
        background: '#18181b',
        color: '#ffffff'
      })
      return
    }

    const toastInfo = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      background: '#18181b',
      color: '#ffffff'
    })
    toastInfo.fire({
      icon: 'info',
      title: 'Empaquetando todas las notas y base de datos...'
    })

    const res = await axios.get(`${API}/files/backup-zip`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })

    const blob = new Blob([res.data], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fecha = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `respaldo_notas_${fecha}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)

    Swal.fire({
      title: 'Respaldo Generado con Exito',
      text: 'Se ha descargado el archivo ZIP con todas las notas en PDF organizadas por anio/mes y el respaldo completo en JSON.',
      icon: 'success',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } catch (err) {
    console.error('Error al descargar respaldo ZIP:', err)
    Swal.fire({
      title: 'Error al Generar Respaldo',
      text: err.response?.data?.msg || 'Ocurrio un error al compilar el archivo ZIP.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } finally {
    descargandoZip.value = false
  }
}

const limpiarBaseDeDatos = async () => {
  if (rolUsuario.value !== 'superadmin') {
    Swal.fire({
      title: 'Acceso Restringido',
      text: 'Solo el Superadministrador cuenta con autorizacion para purgar el sistema.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
    return
  }

  // Paso 1: Advertencia clara sobre la naturaleza destructiva
  const res1 = await Swal.fire({
    title: 'Purga Total del Sistema',
    html: `
      <div class="text-left text-sm space-y-3">
        <p class="text-zinc-300">
          Esta accion es <strong class="text-red-400">definitiva e irreversible</strong>. Se eliminara por completo:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-red-300 font-medium">
          <li>Todas las notas de servicio en la base de datos (${totalArchivos.value} registros).</li>
          <li>Todos los archivos PDF del servidor (${totalFormatted.value}).</li>
        </ul>
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 mt-2">
          <strong>Aviso Importante:</strong> Se sugiere descargar primero el <em>Respaldo ZIP</em> para conservar una copia integra de todos los registros antes de limpiar.
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#27272a',
    confirmButtonText: 'Entiendo el riesgo, continuar',
    cancelButtonText: 'Cancelar',
    background: '#18181b',
    color: '#ffffff'
  })

  if (!res1.isConfirmed) return

  // Paso 2: Validación por palabra clave
  const res2 = await Swal.fire({
    title: 'Confirmacion de Seguridad',
    text: 'Escribe exactamente la palabra LIMPIAR para autorizar la eliminacion permanente:',
    input: 'text',
    inputPlaceholder: 'LIMPIAR',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#27272a',
    confirmButtonText: 'Eliminar Todo Definitivamente',
    cancelButtonText: 'Cancelar',
    background: '#18181b',
    color: '#ffffff',
    preConfirm: (inputVal) => {
      if (!inputVal || inputVal.trim().toUpperCase() !== 'LIMPIAR') {
        Swal.showValidationMessage('Debes escribir exactamente "LIMPIAR" para autorizar la purga')
        return false
      }
      return true
    }
  })

  if (!res2.isConfirmed) return

  try {
    limpiandoBase.value = true

    Swal.fire({
      title: 'Purgando Sistema...',
      text: 'Eliminando registros de MongoDB y limpiando almacenamiento de archivos...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      },
      background: '#18181b',
      color: '#ffffff'
    })

    const token = localStorage.getItem('authToken')
    const res = await axios.post(
      `${API}/files/purge`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    await cargarArbolArchivos()

    Swal.fire({
      title: 'Sistema Purgado',
      text: res.data.msg || 'La base de datos y los archivos han sido eliminados correctamente.',
      icon: 'success',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } catch (err) {
    console.error('Error al purgar base de datos:', err)
    Swal.fire({
      title: 'Error al Purgar',
      text: err.response?.data?.msg || 'Ocurrio un problema al ejecutar la purga.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } finally {
    limpiandoBase.value = false
  }
}

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor || 0)
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      rolUsuario.value = JSON.parse(userData).rol || ''
    } catch (e) {
      rolUsuario.value = ''
    }
  }
  cargarArbolArchivos()
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
            <FolderOpenIcon class="size-4" />
            <span>Almacenamiento Estructurado // storage/pdfs</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Gestor de Archivos de Notas
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Organización cronológica por Año y Mes para respaldo, consulta técnica y control de almacenamiento
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Estadísticas de Almacenamiento -->
          <div class="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-4 shadow-xl">
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-500 block uppercase tracking-wider">Archivos</span>
              <span class="text-sm font-extrabold text-white font-mono">{{ totalArchivos }}</span>
            </div>
            <div class="h-8 w-px bg-white/10"></div>
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-500 block uppercase tracking-wider">Espacio</span>
              <span class="text-sm font-extrabold text-yellow-400 font-mono">{{ totalFormatted }}</span>
            </div>
          </div>

          <!-- Botón Generar Respaldo ZIP -->
          <button
            type="button"
            @click="descargarRespaldoZip"
            :disabled="descargandoZip || totalArchivos === 0"
            class="px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generar y descargar archivo ZIP con todas las notas y base de datos"
          >
            <ArrowDownTrayIcon :class="['size-4', descargandoZip ? 'animate-bounce' : '']" />
            <span>{{ descargandoZip ? 'Generando ZIP...' : 'Descargar Respaldo ZIP' }}</span>
          </button>

          <!-- Botón Limpiar Base de Datos (Exclusivo Superadmin) -->
          <button
            v-if="esSuperadmin"
            type="button"
            @click="limpiarBaseDeDatos"
            :disabled="limpiandoBase || totalArchivos === 0"
            class="px-4 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            title="Limpiar base de datos de notas y vaciar almacenamiento de archivos (Solo Superadministrador)"
          >
            <TrashIcon class="size-4" />
            <span>Limpiar Base</span>
          </button>

          <!-- Botón Recargar -->
          <button
            type="button"
            @click="cargarArbolArchivos"
            :disabled="cargando"
            class="size-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-yellow-400 flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="Recargar archivos"
          >
            <ArrowPathIcon :class="['size-5', cargando ? 'animate-spin text-yellow-400' : '']" />
          </button>
        </div>
      </div>

      <!-- BARRA DE FILTROS Y NAVEGACIÓN POR CARPETAS -->
      <section class="space-y-4 mb-8">
        <!-- Selector de Años -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1.5">
              <CalendarDaysIcon class="size-4 text-yellow-400" />
              <span>Año:</span>
            </span>

            <button
              v-for="y in yearsData"
              :key="y.year"
              type="button"
              @click="seleccionarYear(y.year)"
              :class="[
                selectedYear === y.year
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-950/70 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/5 font-semibold',
                'px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all duration-150 inline-flex items-center gap-2 cursor-pointer'
              ]"
            >
              <FolderIcon class="size-4" />
              <span>{{ y.year }}</span>
              <span
                :class="[
                  selectedYear === y.year ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400',
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold'
                ]"
              >
                {{ y.fileCount }}
              </span>
            </button>
          </div>

          <!-- Buscador en Vivo -->
          <div class="relative w-full sm:w-80">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              v-model="terminoBusqueda"
              type="text"
              placeholder="Buscar por cliente, vehículo o folio..."
              class="w-full rounded-2xl bg-zinc-950/80 border border-white/10 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Selector de Meses para el Año Seleccionado -->
        <div v-if="mesesDisponibles.length > 0" class="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center gap-2 overflow-x-auto">
          <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 shrink-0">
            Meses {{ selectedYear }}:
          </span>

          <button
            type="button"
            @click="selectedMonth = ''"
            :class="[
              selectedMonth === ''
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
              'px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 cursor-pointer'
            ]"
          >
            Todos los meses
          </button>

          <button
            v-for="m in mesesDisponibles"
            :key="m.month"
            type="button"
            @click="seleccionarMonth(m.month)"
            :class="[
              selectedMonth === m.month
                ? 'bg-yellow-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 font-medium',
              'px-3 py-1.5 rounded-xl text-xs transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer'
            ]"
          >
            <span>{{ m.mesLabel }}</span>
            <span
              :class="[
                selectedMonth === m.month ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400',
                'px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold'
              ]"
            >
              {{ m.fileCount }}
            </span>
          </button>
        </div>
      </section>

      <!-- VISTA PRINCIPAL: ARCHIVOS ENCONTRADOS -->
      <section>
        <!-- Estado de Carga -->
        <div v-if="cargando" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <ArrowPathIcon class="size-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p class="text-sm font-semibold text-zinc-300">Explorando carpetas de almacenamiento...</p>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="p-8 text-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p class="text-sm font-bold">{{ error }}</p>
          <button
            @click="cargarArbolArchivos"
            class="mt-3 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="archivosFiltrados.length === 0" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <FolderIcon class="size-12 text-zinc-600 mx-auto mb-3" />
          <h3 class="text-base font-bold text-white">No se encontraron archivos PDF</h3>
          <p class="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            No hay documentos registrados para los filtros seleccionados. Las nuevas notas se guardarán automáticamente en esta estructura.
          </p>
        </div>

        <!-- Cuadrícula de Archivos PDF -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <div
            v-for="archivo in archivosFiltrados"
            :key="archivo.relativePath"
            class="rounded-3xl p-5 bg-zinc-900/80 border border-white/10 hover:border-yellow-500/40 transition-all duration-200 shadow-xl backdrop-blur-xl group relative overflow-hidden flex flex-col justify-between"
          >
            <!-- Borde superior luminoso activo al hover -->
            <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>

            <div>
              <!-- Fila Superior: Icono de Archivo + Sucursal + Total -->
              <div class="flex items-start justify-between gap-3 mb-3.5">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="size-11 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <DocumentTextIcon class="size-6" />
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-extrabold text-white truncate group-hover:text-yellow-400 transition-colors">
                      {{ archivo.cliente || 'Nota de Servicio' }}
                    </h3>
                    <p class="text-xs text-zinc-400 truncate">
                      {{ archivo.vehiculo || archivo.filename }}
                      <span v-if="archivo.modelo" class="text-zinc-500">({{ archivo.modelo }})</span>
                    </p>
                  </div>
                </div>

                <div v-if="archivo.total" class="text-right shrink-0">
                  <span class="text-sm font-extrabold text-yellow-400 font-mono block">
                    {{ formatoMoneda(archivo.total) }}
                  </span>
                </div>
              </div>

              <!-- Fichas de Ruta y Detalles Técnicos -->
              <div class="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1.5 text-xs mb-4">
                <div class="flex items-center justify-between text-zinc-400">
                  <span>Ubicación:</span>
                  <span class="font-mono text-zinc-300 font-bold text-[11px] truncate max-w-[170px]" :title="archivo.relativePath">
                    {{ archivo.relativePath }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-zinc-400">
                  <span>Sucursal:</span>
                  <span class="font-semibold text-zinc-200">
                    {{ archivo.taller || 'Taller Renault' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-zinc-400">
                  <span>Tamaño / Modificado:</span>
                  <span class="font-mono text-zinc-300 text-[11px]">
                    {{ archivo.sizeFormatted }} &bull; {{ new Date(archivo.modifiedAt).toLocaleDateString('es-MX') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción Oficial -->
            <div class="flex items-center gap-2 pt-2 border-t border-white/5">
              <!-- Visualizar -->
              <button
                type="button"
                @click="verArchivo(archivo.relativePath)"
                class="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/30 text-zinc-300 hover:text-yellow-400 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Ver PDF en nueva pestaña"
              >
                <EyeIcon class="size-4" />
                <span>Visualizar</span>
              </button>

              <!-- Descargar -->
              <button
                type="button"
                @click="descargarArchivo(archivo.relativePath, archivo.filename)"
                class="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar archivo a tu equipo"
              >
                <ArrowDownTrayIcon class="size-4" />
                <span>Descargar</span>
              </button>

              <!-- Eliminar (Admin) -->
              <button
                v-if="esAdmin"
                type="button"
                @click="eliminarArchivo(archivo.relativePath, archivo.filename)"
                class="py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-bold inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Eliminar archivo del servidor"
              >
                <TrashIcon class="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

