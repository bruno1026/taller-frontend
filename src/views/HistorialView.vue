
<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/vue/20/solid'
import { CheckIcon } from '@heroicons/vue/20/solid'
const API = import.meta.env.VITE_API_URL

// Estado
const notasGuardadas = ref([])
const cargando = ref(false)
const error = ref('')
const terminoBusqueda = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 8 // Reducido para móviles
const rolUsuario = ref('')

// Filtros
const talleres = [
  { id: 1, name: 'Todos los talleres' },
  { id: 2, name: 'Talisman' },
  { id: 3, name: 'Lutecia' },
]
const filtroTaller = ref(talleres[0])

// Computed
const notasFiltradas = computed(() => {
  let filtered = notasGuardadas.value

  // Filtro por búsqueda
  if (terminoBusqueda.value) {
    const term = terminoBusqueda.value.toLowerCase()
    filtered = filtered.filter(nota =>
      (nota.cliente?.nombre && nota.cliente.nombre.toLowerCase().includes(term)) ||
      (nota.cliente?.vehiculo && nota.cliente.vehiculo.toLowerCase().includes(term)) ||
      (nota.cliente?.modelo && nota.cliente.modelo.toLowerCase().includes(term)) ||
      (nota.cliente?.placas && nota.cliente.placas.toLowerCase().includes(term))
    )
  }

  // Filtro por taller
  if (filtroTaller.value.name !== 'Todos los talleres') {
    filtered = filtered.filter(nota => nota.taller === filtroTaller.value.name)
  }

  return filtered
})

const notasPaginadas = computed(() => {
  const startIndex = (paginaActual.value - 1) * itemsPorPagina
  const endIndex = startIndex + itemsPorPagina
  return notasFiltradas.value.slice(startIndex, endIndex)
})

const esAdmin = computed(() => rolUsuario.value === 'admin')

const totalPaginas = computed(() => {
  return Math.ceil(notasFiltradas.value.length / itemsPorPagina)
})

const paginas = computed(() => {
  const pages = []
  const total = totalPaginas.value
  const current = paginaActual.value

  // Mostrar máximo 3 páginas en móvil, 5 en desktop
  const maxPages = window.innerWidth < 640 ? 3 : 5
  let start = Math.max(1, current - Math.floor(maxPages / 2))
  let end = Math.min(total, start + maxPages - 1)

  // Ajustar si estamos cerca del final
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Métodos
const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor)
}

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
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    notasGuardadas.value = response.data
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

const verPDF = async (notaId) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      alert('⚠️ No hay sesión activa. Inicia sesión nuevamente.')
      return
    }

    const response = await axios.get(`${API}/notes/${notaId}/descargar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => window.URL.revokeObjectURL(url), 60000)
  } catch (error) {
    console.error('Error viendo PDF:', error)
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        alert(`❌ ${json.msg || 'Error al abrir el PDF'}`)
        return
      } catch (e) {
        // fallback
      }
    }
    alert('❌ Error al abrir el PDF')
  }
}

const descargarPDF = async (notaId, nombreCliente) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      alert('⚠️ No hay sesión activa. Inicia sesión nuevamente.')
      return
    }

    const response = await axios.get(`${API}/notes/${notaId}/descargar`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
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
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        alert(`❌ ${json.msg || 'Error al descargar el PDF'}`)
        return
      } catch (e) {
        // fallback
      }
    }
    alert('❌ Error al descargar el PDF')
  }
}

const eliminarNota = async (id) => {
  if (!esAdmin.value) {
    alert('Solo un administrador puede eliminar notas')
    return
  }
  if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
    return
  }

  try {
    const token = localStorage.getItem("authToken")
    await axios.delete(`${API}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    await cargarNotas()
  } catch (err) {
    console.error("Error eliminando nota", err)
    alert('❌ Error al eliminar la nota')
  }
}

// Observadores
import { watch } from 'vue'

watch([terminoBusqueda, filtroTaller], () => {
  paginaActual.value = 1
})

// Ciclo de vida
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
  <div class="min-h-full bg-gray-950">
    <header class="bg-gray-900 shadow">
      <div class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <h1 class="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">Historial de Notas</h1>
      </div>
    </header>

    <main>
      <div class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <!-- Buscador -->
        <div class="mb-4 sm:mb-6">
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon class="size-4 text-gray-400 sm:size-5" aria-hidden="true" />
            </div>
            <input
              v-model="terminoBusqueda"
              type="text"
              class="block w-full rounded-md border-0 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:text-base"
              placeholder="Buscar por cliente o vehículo..."
            />
          </div>
        </div>

        <!-- Filtros adicionales -->
        <div class="mb-4 sm:mb-6">
          <Listbox as="div" v-model="filtroTaller">
            <ListboxLabel class="block text-sm font-medium text-white mb-1">Taller</ListboxLabel>
            <div class="relative">
              <ListboxButton class="grid w-full cursor-default grid-cols-1 rounded-md bg-white/5 py-2 pr-2 pl-3 text-left text-white outline-1 -outline-offset-1 outline-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 text-sm sm:text-base">
                <span class="col-start-1 row-start-1 flex items-center gap-2 pr-6">
                  <span class="block truncate text-sm sm:text-base">{{ filtroTaller.name }}</span>
                </span>
                <ChevronUpDownIcon class="col-start-1 row-start-1 size-4 self-center justify-self-end text-gray-400 sm:size-5" aria-hidden="true" />
              </ListboxButton>

              <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base outline-1 -outline-offset-1 outline-white/10 text-sm sm:text-base">
                  <ListboxOption as="template" v-for="taller in talleres" :key="taller.id" :value="taller" v-slot="{ active, selected }">
                    <li :class="[active ? 'bg-indigo-500 text-white outline-hidden' : 'text-white', 'relative cursor-default py-2 pr-9 pl-3 select-none']">
                      <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate text-sm sm:text-base']">{{ taller.name }}</span>
                      <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-400', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                        <CheckIcon class="size-4 sm:size-5" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>

        <!-- Contenido principal -->
        <div class="bg-gray-800/50 rounded-lg shadow">
          <!-- Estado de carga/error -->
          <div v-if="cargando" class="p-6 text-center sm:p-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto sm:h-12 sm:w-12"></div>
            <p class="mt-3 text-gray-300 text-sm sm:text-base sm:mt-4">Cargando notas...</p>
          </div>

          <div v-else-if="error" class="p-6 text-center sm:p-8">
            <p class="text-red-400 text-sm sm:text-base">❌ {{ error }}</p>
            <button @click="cargarNotas" class="mt-3 bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 text-sm sm:mt-4 sm:px-4 sm:py-2 sm:text-base">
              Reintentar
            </button>
          </div>

          <div v-else>
            <!-- Lista de notas -->
            <ul role="list" class="divide-y divide-white/10">
              <li v-for="nota in notasPaginadas" :key="nota._id" class="p-3 sm:px-4 sm:py-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <!-- Información de la nota -->
                  <div class="flex-1 min-w-0">
                    <!-- Header móvil -->
                    <div class="flex items-start justify-between mb-2 sm:hidden">
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <p class="truncate text-sm font-medium text-white flex-1">
                          {{ nota.cliente.nombre }}
                        </p>
                        <span class="inline-flex items-center rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-600/20 shrink-0">
                          {{ nota.taller }}
                        </span>
                      </div>
                      <p class="text-lg font-bold text-green-400 ml-2 shrink-0">
                        {{ formatoMoneda(nota.total) }}
                      </p>
                    </div>

                    <!-- Header desktop -->
                    <div class="hidden sm:flex sm:items-center sm:gap-3 sm:mb-1">
                      <p class="truncate text-sm font-medium text-white">
                        {{ nota.cliente.nombre }}
                      </p>
                      <span class="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-600/20">
                        {{ nota.taller }}
                      </span>
                    </div>

                    <!-- Detalles -->
                    <div class="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                      <span class="flex items-center gap-1 text-xs text-gray-300 sm:text-sm">
                        🚗 {{ nota.cliente.vehiculo }}
                        <span v-if="nota.cliente.modelo" class="text-gray-400">({{ nota.cliente.modelo }})</span>
                      </span>
                      <span class="flex items-center gap-1 text-xs text-gray-300 sm:text-sm">
                        🔧 {{ nota.cliente.servicio }}
                      </span>
                      <span class="flex items-center gap-1 text-xs text-gray-300 sm:text-sm">
                        📅 {{ new Date(nota.createdAt).toLocaleDateString('es-MX') }}
                      </span>
                      <span v-if="nota.cliente.placas" class="flex items-center gap-1 text-xs text-gray-300 sm:text-sm">
                        🚙 {{ nota.cliente.placas }}
                      </span>
                    </div>
                  </div>

                  <!-- Botones y total (desktop) -->
                  <div class="hidden sm:flex sm:flex-col sm:items-end sm:gap-2">
                    <div class="text-right">
                      <p class="text-lg font-bold text-green-400">
                        {{ formatoMoneda(nota.total) }}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="descargarPDF(nota._id, nota.cliente.nombre)"
                        class="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        <ArrowDownTrayIcon class="size-4" />
                        <span class="hidden xs:inline">Descargar</span>
                      </button>
                      <button
                        v-if="esAdmin"
                        @click="eliminarNota(nota._id)"
                        class="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <TrashIcon class="size-4" />
                        <span class="hidden xs:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>

                  <!-- Botones móvil -->
                  <div class="flex justify-between gap-2 sm:hidden">
                    <button
                      @click="descargarPDF(nota._id, nota.cliente.nombre)"
                      class="inline-flex items-center justify-center rounded-md bg-green-600 p-2 text-white shadow-sm hover:bg-green-500 flex-1"
                      title="Descargar PDF"
                    >
                      <ArrowDownTrayIcon class="size-4" />
                    </button>
                    <button
                      v-if="esAdmin"
                      @click="eliminarNota(nota._id)"
                      class="inline-flex items-center justify-center rounded-md bg-red-600 p-2 text-white shadow-sm hover:bg-red-500 flex-1"
                      title="Eliminar"
                    >
                      <TrashIcon class="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <!-- Paginación -->
            <div class="flex items-center justify-between border-t border-white/10 px-3 py-3 sm:px-4 sm:py-3">
              <div class="flex flex-1 justify-between sm:hidden">
                <button
                  @click="paginaActual--"
                  :disabled="paginaActual === 1"
                  class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div class="flex items-center">
                  <span class="text-xs text-gray-300 mx-2">
                    Pág. {{ paginaActual }} de {{ totalPaginas }}
                  </span>
                </div>
                <button
                  @click="paginaActual++"
                  :disabled="paginaActual >= totalPaginas"
                  class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>

              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-300">
                    Mostrando
                    <span class="font-medium mx-1">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</span>
                    a
                    <span class="font-medium mx-1">{{ Math.min(paginaActual * itemsPorPagina, notasFiltradas.length) }}</span>
                    de
                    <span class="font-medium mx-1">{{ notasFiltradas.length }}</span>
                    resultados
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md" aria-label="Pagination">
                    <button
                      @click="paginaActual--"
                      :disabled="paginaActual === 1"
                      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Anterior</span>
                      <ChevronLeftIcon class="size-4 sm:size-5" aria-hidden="true" />
                    </button>
                    <button
                      v-for="pagina in paginas"
                      :key="pagina"
                      @click="paginaActual = pagina"
                      :class="[
                        pagina === paginaActual
                          ? 'relative z-10 inline-flex items-center bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                          : 'relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0'
                      ]"
                    >
                      {{ pagina }}
                    </button>
                    <button
                      @click="paginaActual++"
                      :disabled="paginaActual >= totalPaginas"
                      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Siguiente</span>
                      <ChevronRightIcon class="size-4 sm:size-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            <!-- Sin resultados -->
            <div v-if="notasFiltradas.length === 0" class="p-6 text-center sm:p-8">
              <p class="text-gray-400 text-sm sm:text-base">No se encontraron notas que coincidan con tu búsqueda.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

