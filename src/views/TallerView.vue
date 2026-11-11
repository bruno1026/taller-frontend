<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'
import {
  UserIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  SparklesIcon,
  InformationCircleIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
  DocumentCheckIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL
const route = useRoute()
const router = useRouter()
const tallerParam = route.params.taller || 'talisman'

const usuario = ref(null)

// Nombre legible del taller según parámetro de ruta
const nombreTaller = computed(() => {
  const t = String(tallerParam).toLowerCase()
  if (t === 'lutecia') return 'Taller Lutecia'
  return 'Taller Talismán'
})

const codigoSucursal = computed(() => {
  const t = String(tallerParam).toLowerCase()
  if (t === 'lutecia') return 'SUCURSAL 02 // EDOMEX'
  return 'SUCURSAL 01 // CDMX'
})

// Catálogo completo de vehículos Renault para autocomplete
const vehiculos = [
  'DUSTER',
  'KWID',
  'KWID E-TECH',
  'STEPWAY',
  'SANDERO',
  'LOGAN',
  'OROCH',
  'KOLEOS',
  'KANGOO',
  'KANGOO E-TECH',
  'KARDIAN',
  'ARKANA',
  'CLIO',
  'MEGANE',
  'FLUENCE',
  'SCENIC',
  'PLATINA'
]

// Años de modelos en orden descendente para rápida selección
const modelos = Array.from({ length: 26 }, (_, i) => (2026 - i).toString())

// Estados para autocompletado de vehículos
const mostrarAutocomplete = ref(false)
const vehiculosFiltrados = ref([])

// Estados para inspección visual de daños en silueta
const daños = ref([])
const mostrarModalDaños = ref(false)
const dañoSeleccionado = ref(null)
const descripcionDaño = ref('')
const tipoDaño = ref('rayon')

const puedeGuardarDaño = computed(() => {
  return Boolean(dañoSeleccionado.value && descripcionDaño.value.trim())
})

// Formulario de Nota de Servicio
const form = reactive({
  taller: tallerParam.charAt(0).toUpperCase() + tallerParam.slice(1),
  cliente: {
    nombre: '',
    vehiculo: '',
    modelo: '',
    placas: '',
    kilometraje: '',
    servicio: ''
  },
  items: [
    { cantidad: 1, descripcion: '', precio: 0 }
  ],
  observaciones: '',
  tieneGarantia: true,
  garantiaTiempo: 6,
  garantiaUnidad: 'meses',
  garantia: '6 MESES DE GARANTÍA',
  incluirFirmas: true,
  daños: []
})

const mostrarTerminosGarantia = ref(false)

const terminosGarantiaLista = [
  { punto: 'Punto 1', texto: 'La garantía quedará sin efecto si cualquier persona ajena al taller interviene, repara o desarma la transmisión.' },
  { punto: 'Punto 2', texto: 'La garantía no aplica en caso de que el daño haya sido ocasionado de forma deliberada o por uso indebido.' },
  { punto: 'Punto 3', texto: 'En caso de presentarse alguna falla relacionada con la reparación, el vehículo deberá permanecer en nuestras instalaciones para su revisión y/o corrección. No se realizan servicios de garantía a domicilio.' },
  { punto: 'Punto 4', texto: 'La garantía cubre únicamente la reparación del sistema hidráulico y de presión de la transmisión. No incluye fallas electrónicas ni de sensores.' },
  { punto: 'Punto 5', texto: 'La garantía no cubre daños derivados de colisiones, impactos o ruptura de la caja de transmisión.' },
  { punto: 'Punto 6', texto: 'La garantía no aplica en casos de daños ocasionados por inundación o ingreso de agua. Si la transmisión presenta indicios de haber sido expuesta a charcos o condiciones similares, la garantía quedará automáticamente anulada.' },
  { punto: 'Punto 7', texto: 'La garantía no será válida si el vehículo es utilizado para fines distintos a los establecidos por el fabricante. En el caso de unidades diseñadas para transporte de pasajeros, no se cubren daños derivados del uso para carga o sobrepeso.' }
]

watch(
  () => [form.tieneGarantia, form.garantiaTiempo, form.garantiaUnidad],
  ([activo, tiempo, unidad]) => {
    if (!activo || !tiempo || Number(tiempo) <= 0) {
      form.garantia = 'Sin garantía'
      return
    }
    const num = Math.max(1, parseInt(tiempo, 10) || 1)
    let unidadTxt = unidad
    if (unidad === 'dias') {
      unidadTxt = num === 1 ? 'DÍA' : 'DÍAS'
    } else if (unidad === 'meses') {
      unidadTxt = num === 1 ? 'MES' : 'MESES'
    } else if (unidad === 'años') {
      unidadTxt = num === 1 ? 'AÑO' : 'AÑOS'
    }
    form.garantia = `${num} ${unidadTxt} DE GARANTÍA`
  },
  { immediate: true }
)

const cargando = ref(false)
const mensaje = ref('')

const filtrarVehiculos = (busqueda) => {
  if (!busqueda) {
    vehiculosFiltrados.value = []
    return
  }
  const busquedaLower = busqueda.toLowerCase()
  vehiculosFiltrados.value = vehiculos.filter(v =>
    v.toLowerCase().includes(busquedaLower)
  )
}

const seleccionarVehiculo = (vehiculo) => {
  form.cliente.vehiculo = vehiculo
  mostrarAutocomplete.value = false
}

const manejarInputVehiculo = (event) => {
  const valor = event.target.value
  form.cliente.vehiculo = valor
  filtrarVehiculos(valor)
  mostrarAutocomplete.value = valor.length > 0
}

const manejarKilometraje = (event) => {
  let valor = event.target.value
  valor = valor.replace(/\s*KM\s*$/i, '').trim()
  valor = valor.replace(/[^\d,]/g, '')
  if (valor) {
    form.cliente.kilometraje = valor + ' KM'
  } else {
    form.cliente.kilometraje = ''
  }
}

const focusKilometraje = (event) => {
  const input = event.target
  const valor = input.value.replace(/\s*KM\s*$/i, '')
  setTimeout(() => {
    input.setSelectionRange(0, valor.length)
  }, 0)
}

// Métodos para partidas
const agregarItem = () => {
  form.items.push({ cantidad: 1, descripcion: '', precio: 0 })
}

const eliminarItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

// Modal de daños
const abrirModalDaños = () => {
  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = true
}

const agregarPuntoDaño = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  dañoSeleccionado.value = {
    id: Date.now(),
    x: x,
    y: y,
    tipo: tipoDaño.value,
    descripcion: '',
    timestamp: new Date().toISOString()
  }
}

const guardarDaño = () => {
  if (!puedeGuardarDaño.value) return

  dañoSeleccionado.value.descripcion = descripcionDaño.value.trim()
  daños.value.push({ ...dañoSeleccionado.value })
  form.daños.push({ ...dañoSeleccionado.value })

  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = false
}

const eliminarDaño = (id) => {
  daños.value = daños.value.filter(d => d.id !== id)
  form.daños = form.daños.filter(d => d.id !== id)
}

const cancelarDaño = () => {
  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = false
}

const getColorDaño = (tipo) => {
  const colores = {
    rayon: '#ef4444',
    aboyadura: '#f59e0b',
    golpe: '#a855f7',
    rotura: '#f97316',
    otro: '#71717a'
  }
  return colores[tipo] || colores.otro
}

const getLabelDaño = (tipo) => {
  const labels = {
    rayon: 'Rayón',
    aboyadura: 'Abolladura',
    golpe: 'Golpe',
    rotura: 'Rotura',
    otro: 'Otro'
  }
  return labels[tipo] || labels.otro
}

// Total calculado
const total = computed(() => {
  return form.items.reduce((sum, item) => {
    return sum + (Number(item.precio) || 0)
  }, 0)
})

const resetearFormulario = () => {
  Object.assign(form, {
    taller: tallerParam.charAt(0).toUpperCase() + tallerParam.slice(1),
    cliente: {
      nombre: '',
      vehiculo: '',
      modelo: '',
      placas: '',
      kilometraje: '',
      servicio: ''
    },
    items: [{ cantidad: 1, descripcion: '', precio: 0 }],
    observaciones: '',
    tieneGarantia: true,
    garantiaTiempo: 6,
    garantiaUnidad: 'meses',
    garantia: '6 MESES DE GARANTÍA',
    incluirFirmas: true,
    daños: []
  })
  daños.value = []
  mostrarTerminosGarantia.value = false
}

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor || 0)
}

const modoEdicion = ref(false)
const notaIdEdicion = ref(null)

const cargarNotaParaEdicion = async (id) => {
  try {
    cargando.value = true
    const currentToken = localStorage.getItem('authToken')
    const res = await axios.get(`${API}/notes/${id}`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    })

    if (res.data?.ok && res.data?.nota) {
      const nota = res.data.nota
      modoEdicion.value = true
      notaIdEdicion.value = nota._id

      if (nota.cliente) {
        form.cliente = {
          nombre: nota.cliente.nombre || '',
          vehiculo: nota.cliente.vehiculo || '',
          modelo: nota.cliente.modelo || '',
          placas: nota.cliente.placas || '',
          kilometraje: nota.cliente.kilometraje || '',
          servicio: nota.cliente.servicio || ''
        }
      }

      if (Array.isArray(nota.items) && nota.items.length > 0) {
        form.items = nota.items.map(it => ({
          cantidad: it.cantidad || 1,
          descripcion: it.descripcion || '',
          precio: it.precio || 0
        }))
      }

      form.observaciones = nota.observaciones || ''
      form.incluirFirmas = nota.incluirFirmas !== undefined ? Boolean(nota.incluirFirmas) : true

      if (nota.tieneGarantia !== undefined) {
        form.tieneGarantia = Boolean(nota.tieneGarantia)
        form.garantiaTiempo = Number(nota.garantiaTiempo) || 6
        form.garantiaUnidad = nota.garantiaUnidad || 'meses'
        form.garantia = nota.garantia || '6 MESES DE GARANTÍA'
      } else if (nota.garantia) {
        const gLower = nota.garantia.toLowerCase()
        if (gLower.includes('sin garantia') || gLower.includes('no especificada') || gLower === '') {
          form.tieneGarantia = false
          form.garantiaTiempo = 0
          form.garantia = 'Sin garantía'
        } else {
          form.tieneGarantia = true
          const matchNum = nota.garantia.match(/\d+/)
          form.garantiaTiempo = matchNum ? parseInt(matchNum[0], 10) : 6
          if (gLower.includes('dia') || gLower.includes('día')) {
            form.garantiaUnidad = 'dias'
          } else if (gLower.includes('año')) {
            form.garantiaUnidad = 'años'
          } else {
            form.garantiaUnidad = 'meses'
          }
          form.garantia = nota.garantia
        }
      }

      if (Array.isArray(nota.daños)) {
        daños.value = nota.daños
        form.daños = nota.daños
      }
    }
  } catch (err) {
    console.error('Error cargando nota para edición:', err)
    Swal.fire({
      title: 'Nota no encontrada',
      text: 'No se pudo cargar la nota para edición.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } finally {
    cargando.value = false
  }
}

const enviarNota = async () => {
  try {
    cargando.value = true
    mensaje.value = ''

    const currentToken = localStorage.getItem('authToken')
    if (!currentToken) {
      Swal.fire({
        title: 'Sesión no encontrada',
        text: 'Por favor inicia sesión para generar notas.',
        icon: 'warning',
        confirmButtonColor: '#eab308',
        background: '#18181b',
        color: '#ffffff'
      })
      return
    }

    const payload = {
      ...form,
      total: total.value
    }

    if (modoEdicion.value && notaIdEdicion.value) {
      await axios.put(`${API}/notes/${notaIdEdicion.value}`, payload, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      })

      Swal.fire({
        title: 'Nota Actualizada con Éxito',
        text: 'Los cambios y el nuevo importe se guardaron y el PDF oficial se regeneró correctamente.',
        icon: 'success',
        confirmButtonColor: '#eab308',
        confirmButtonText: 'Ver en Historial',
        background: '#18181b',
        color: '#ffffff'
      }).then(() => {
        router.push('/historial')
      })
      return
    }

    await axios.post(`${API}/notes`, payload, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    })

    Swal.fire({
      title: 'Nota de Servicio Registrada',
      text: 'El comprobante oficial PDF y la orden de taller se generaron con éxito.',
      icon: 'success',
      confirmButtonColor: '#eab308',
      confirmButtonText: 'Aceptar',
      background: '#18181b',
      color: '#ffffff'
    })

    resetearFormulario()
  } catch (error) {
    console.error('Error:', error)
    const errorMsg = error.response?.data?.msg || error.message
    Swal.fire({
      title: 'Error al Guardar Nota',
      text: errorMsg,
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      usuario.value = JSON.parse(userData)
    } catch (e) {
      usuario.value = null
    }
  }

  if (route.query.editar) {
    cargarNotaParaEdicion(route.query.editar)
  }
})
</script>

<template>
  <div class="min-h-screen text-zinc-100 relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <!-- Fondo tecnológico de alta gama -->
    <TechBackground />

    <!-- Contenedor Principal del Sistema de Notas Expandido -->
    <main class="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14 py-6 sm:py-8 flex-1">
      <!-- Barra Superior de Navegación del Taller -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-white/10">
        <div>
          <button
            type="button"
            @click="router.push('/seleccion-taller')"
            class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-yellow-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeftIcon class="size-4" />
            <span>Volver a Selección de Taller</span>
          </button>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Generador de Notas de Servicio
            </h1>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Recepción técnica, registro de daños y emisión de presupuesto garantizado
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Badge de la sucursal activa -->
          <div class="p-3 rounded-2xl bg-zinc-900/90 border border-yellow-500/30 flex items-center gap-3 shadow-lg shadow-yellow-500/5">
            <div class="size-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
                <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
              </svg>
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold text-yellow-500 block uppercase tracking-wider">{{ codigoSucursal }}</span>
              <span class="text-sm font-extrabold text-white">{{ nombreTaller }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Informativo de Modo Edición -->
      <div v-if="modoEdicion" class="mb-6 p-4.5 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        <div class="flex items-center gap-3.5">
          <div class="size-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-extrabold shadow-md shadow-yellow-500/20 shrink-0">
            <PencilSquareIcon class="size-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">Modo Edición Activo</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono font-bold">ID: {{ String(notaIdEdicion).slice(-6) }}</span>
            </div>
            <p class="text-xs sm:text-sm text-zinc-200 mt-0.5">
              Editando orden para <strong class="text-white">{{ form.cliente.nombre || 'Cliente' }}</strong>. Modifica los importes, partidas o datos necesarios y guarda los cambios para regenerar el PDF.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="router.push('/historial')"
          class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          Cancelar Edición
        </button>
      </div>

      <!-- Layout en Cuadrícula: Formulario (8 Cols) + Vista Previa (4 Cols) con óptimo aprovechamiento horizontal -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        <!-- Columna Izquierda: Formulario de Captura -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
          <form @submit.prevent="enviarNota" class="space-y-6 sm:space-y-8">
            <!-- SECCIÓN 1: DATOS DEL CLIENTE Y VEHÍCULO -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <div class="flex items-center gap-3 pb-5 border-b border-white/10 mb-6">
                <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <UserIcon class="size-5" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-white">Datos del Cliente y Vehículo</h2>
                  <p class="text-xs text-zinc-400">Identificación oficial para la orden de trabajo</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                <!-- Nombre completo -->
                <div class="sm:col-span-2 xl:col-span-1">
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input
                    v-model="form.cliente.nombre"
                    type="text"
                    placeholder="Ej. Roberto Martínez García"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none"
                  />
                </div>

                <!-- Vehículo con autocomplete -->
                <div class="relative">
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Vehículo Renault</label>
                  <input
                    v-model="form.cliente.vehiculo"
                    @input="manejarInputVehiculo"
                    @focus="mostrarAutocomplete = form.cliente.vehiculo.length > 0"
                    @blur="setTimeout(() => mostrarAutocomplete = false, 200)"
                    type="text"
                    placeholder="Ej. DUSTER, STEPWAY..."
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none uppercase font-semibold"
                  />

                  <!-- Dropdown de autocomplete -->
                  <div
                    v-if="mostrarAutocomplete && vehiculosFiltrados.length > 0"
                    class="absolute z-30 mt-1.5 w-full max-h-56 overflow-auto rounded-xl bg-zinc-900 border border-white/10 py-1.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div
                      v-for="v in vehiculosFiltrados"
                      :key="v"
                      @mousedown="seleccionarVehiculo(v)"
                      class="px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-yellow-500 hover:text-black transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{{ v }}</span>
                      <span class="text-[10px] text-zinc-400 font-normal">Renault</span>
                    </div>
                  </div>
                </div>

                <!-- Modelo / Año -->
                <div>
                  <Listbox as="div" v-model="form.cliente.modelo">
                    <ListboxLabel class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Año del Modelo</ListboxLabel>
                    <div class="relative">
                      <ListboxButton class="relative w-full cursor-pointer rounded-xl bg-zinc-950/70 border border-white/10 py-2.5 pl-3.5 pr-10 text-left text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none">
                        <span class="block truncate font-mono font-medium">{{ form.cliente.modelo || 'Seleccionar año' }}</span>
                        <ChevronUpDownIcon class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                      </ListboxButton>

                      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                        <ListboxOptions class="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl bg-zinc-900 border border-white/10 py-1.5 text-xs shadow-2xl">
                          <ListboxOption as="template" v-for="m in modelos" :key="m" :value="m" v-slot="{ active, selected }">
                            <li :class="[active ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-200', 'relative cursor-pointer py-2 pl-3.5 pr-9 font-mono']">
                              <span>{{ m }}</span>
                              <span v-if="selected" :class="[active ? 'text-black' : 'text-yellow-400', 'absolute inset-y-0 right-0 flex items-center pr-3']">
                                <CheckIcon class="size-4" />
                              </span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </div>
                  </Listbox>
                </div>

                <!-- Placas -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Placas</label>
                  <input
                    v-model="form.cliente.placas"
                    type="text"
                    placeholder="Ej. NYU-477-A"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none uppercase font-mono"
                  />
                </div>

                <!-- Kilometraje -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Kilometraje</label>
                  <input
                    v-model="form.cliente.kilometraje"
                    @input="manejarKilometraje"
                    @focus="focusKilometraje"
                    type="text"
                    placeholder="Ej. 65,400"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none font-mono"
                  />
                </div>

                <!-- Servicio Solicitado -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Servicio Principal</label>
                  <input
                    v-model="form.cliente.servicio"
                    type="text"
                    placeholder="Ej. Afinación Mayor y Frenos"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-all outline-none"
                  />
                </div>
              </div>
            </section>

            <!-- SECCIÓN 2: INSPECCIÓN VISUAL DEL VEHÍCULO -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 mb-6 gap-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <EyeIcon class="size-5" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-white">Inspección Visual de Carrocería</h2>
                    <p class="text-xs text-zinc-400">Registro de condiciones exteriores y daños preexistentes</p>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 flex-wrap">
                  <select
                    v-model="tipoDaño"
                    class="rounded-xl bg-zinc-950/70 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:border-yellow-500 outline-none cursor-pointer"
                  >
                    <option value="rayon">Rayón</option>
                    <option value="aboyadura">Abolladura</option>
                    <option value="golpe">Golpe</option>
                    <option value="rotura">Rotura</option>
                    <option value="otro">Otro</option>
                  </select>

                  <button
                    type="button"
                    @click="abrirModalDaños"
                    class="px-3.5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs inline-flex items-center gap-1.5 shadow-md shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <PlusIcon class="size-4" />
                    <span>Marcar en Silueta</span>
                  </button>

                  <button
                    v-if="daños.length > 0"
                    type="button"
                    @click="daños = []; form.daños = []"
                    class="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 text-zinc-400 hover:text-red-400 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <TrashIcon class="size-3.5" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              <!-- Tip descriptivo sin emojis -->
              <div class="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-start gap-3 text-xs text-zinc-300 mb-6">
                <InformationCircleIcon class="size-5 text-yellow-400 shrink-0 mt-0.5" />
                <div class="leading-relaxed">
                  Presione <strong class="text-white">"Marcar en Silueta"</strong> para desplegar la vista de inspección. Podrá situar el punto exacto en la carrocería del automóvil y registrar rayones, golpes o detalles para transparencia con el cliente.
                </div>
              </div>

              <!-- Lista de Daños Registrados -->
              <div v-if="daños.length > 0" class="space-y-2.5">
                <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Puntos de inspección registrados ({{ daños.length }})
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  <div
                    v-for="(daño, index) in daños"
                    :key="daño.id"
                    class="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-xs"
                  >
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        class="size-3 rounded-full shrink-0"
                        :style="{ backgroundColor: getColorDaño(daño.tipo) }"
                      ></span>
                      <span class="font-bold text-yellow-400 font-mono">#{{ index + 1 }}</span>
                      <span class="font-semibold text-zinc-300 shrink-0">{{ getLabelDaño(daño.tipo) }}:</span>
                      <span class="text-zinc-200 truncate">{{ daño.descripcion }}</span>
                    </div>
                    <button
                      type="button"
                      @click="eliminarDaño(daño.id)"
                      class="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors ml-2"
                      title="Eliminar punto"
                    >
                      <TrashIcon class="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- SECCIÓN 3: PARTIDAS, REFACCIONES Y SERVICIOS -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <div class="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <WrenchScrewdriverIcon class="size-5" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-white">Partidas, Servicios y Refacciones</h2>
                    <p class="text-xs text-zinc-400">Desglose de mano de obra y piezas para el cálculo oficial</p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="agregarItem"
                  class="px-3.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusIcon class="size-4" />
                  <span>Agregar Partida</span>
                </button>
              </div>

              <!-- Listado de Partidas -->
              <div class="space-y-3">
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="grid grid-cols-12 gap-3 items-end p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <!-- Cantidad -->
                  <div class="col-span-3 sm:col-span-2 xl:col-span-1">
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cant.</label>
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      min="1"
                      class="block w-full rounded-xl bg-zinc-900 border border-white/10 px-2.5 py-2 text-center text-sm font-mono text-white focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <!-- Descripción -->
                  <div class="col-span-9 sm:col-span-6 xl:col-span-8">
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Descripción de Trabajo o Refacción</label>
                    <input
                      v-model="item.descripcion"
                      type="text"
                      placeholder="Ej. Cambio de Kit de Distribución y Bomba de Agua"
                      class="block w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <!-- Precio Total -->
                  <div class="col-span-10 sm:col-span-3 xl:col-span-2">
                    <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Importe ($ MXN)</label>
                    <input
                      v-model.number="item.precio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="block w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-right text-sm font-mono font-bold text-yellow-400 focus:border-yellow-500 outline-none"
                    />
                  </div>

                  <!-- Eliminar partida -->
                  <div class="col-span-2 sm:col-span-1 xl:col-span-1 flex justify-center pb-2">
                    <button
                      v-if="form.items.length > 1"
                      type="button"
                      @click="eliminarItem(index)"
                      class="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                      title="Eliminar partida"
                    >
                      <TrashIcon class="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- SECCIÓN 4: OBSERVACIONES Y GARANTÍA -->
            <section class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Observaciones -->
              <div class="rounded-3xl p-6 bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl">
                <div class="flex items-center gap-2 mb-3">
                  <DocumentTextIcon class="size-4 text-yellow-400" />
                  <h3 class="text-sm font-bold text-white uppercase tracking-wider">Observaciones Técnicas</h3>
                </div>
                <textarea
                  v-model="form.observaciones"
                  rows="3"
                  placeholder="Detalles sobre pruebas de ruta, diagnósticos pendientes o recomendaciones..."
                  class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 outline-none resize-none leading-relaxed"
                ></textarea>
              </div>

              <!-- Garantía -->
              <div class="rounded-3xl p-6 bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-4">
                    <div class="flex items-center gap-2">
                      <ShieldCheckIcon class="size-4 text-yellow-400" />
                      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Garantía del Servicio</h3>
                    </div>

                    <!-- Botones de Estado: Con o Sin Garantía -->
                    <div class="inline-flex rounded-xl bg-zinc-950 p-1 border border-white/10 text-xs">
                      <button
                        type="button"
                        @click="form.tieneGarantia = false"
                        :class="[
                          !form.tieneGarantia
                            ? 'bg-zinc-800 text-white font-bold'
                            : 'text-zinc-400 hover:text-white',
                          'px-2.5 py-1 rounded-lg transition-colors cursor-pointer'
                        ]"
                      >
                        Sin Garantía
                      </button>
                      <button
                        type="button"
                        @click="form.tieneGarantia = true"
                        :class="[
                          form.tieneGarantia
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-sm'
                            : 'text-zinc-400 hover:text-white',
                          'px-2.5 py-1 rounded-lg transition-colors cursor-pointer'
                        ]"
                      >
                        Con Garantía
                      </button>
                    </div>
                  </div>

                  <!-- Campos Numéricos y Unidad (cuando tieneGarantia es true) -->
                  <div v-if="form.tieneGarantia" class="space-y-3.5">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Cantidad
                        </label>
                        <input
                          v-model.number="form.garantiaTiempo"
                          type="number"
                          min="1"
                          max="365"
                          placeholder="6"
                          class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2 text-sm text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Unidad de Tiempo
                        </label>
                        <select
                          v-model="form.garantiaUnidad"
                          class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer"
                        >
                          <option value="dias">Días</option>
                          <option value="meses">Meses</option>
                          <option value="años">Años</option>
                        </select>
                      </div>
                    </div>

                    <!-- Previsualización del banner dorado oficial que saldrá en la nota -->
                    <div class="p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-center font-extrabold text-sm sm:text-base tracking-wide uppercase shadow-md shadow-yellow-500/20 border border-yellow-300">
                      {{ form.garantia }}
                    </div>

                    <!-- Desplegable para ver los 7 términos de garantía -->
                    <div class="pt-2 border-t border-white/10">
                      <button
                        type="button"
                        @click="mostrarTerminosGarantia = !mostrarTerminosGarantia"
                        class="w-full flex items-center justify-between text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors py-1 cursor-pointer"
                      >
                        <span class="inline-flex items-center gap-1.5">
                          <DocumentCheckIcon class="size-4" />
                          <span>Términos y condiciones incluidos (7 puntos)</span>
                        </span>
                        <ChevronDownIcon :class="['size-4 transition-transform', mostrarTerminosGarantia ? 'rotate-180' : '']" />
                      </button>

                      <div v-if="mostrarTerminosGarantia" class="mt-2.5 p-3 rounded-xl bg-zinc-950/80 border border-white/5 space-y-2 text-[11px] text-zinc-300 max-h-48 overflow-y-auto leading-relaxed">
                        <p class="text-zinc-400 italic">
                          Para que la garantía sea válida, el cliente deberá cumplir con los siguientes puntos:
                        </p>
                        <ul class="space-y-1.5 list-disc list-inside text-zinc-300">
                          <li v-for="t in terminosGarantiaLista" :key="t.punto">
                            <strong class="text-yellow-400">{{ t.punto }}:</strong> {{ t.texto }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div v-else class="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 text-center">
                    <p class="text-xs text-zinc-500">
                      Esta nota de servicio no incluirá banner de garantía ni cláusulas de cobertura.
                    </p>
                  </div>
                </div>

                <p class="text-[10px] text-zinc-500 mt-3">
                  {{ form.tieneGarantia ? 'Se imprimirá el banner destacado y los 7 términos oficiales al pie del PDF.' : 'Se generará como nota de servicio estándar.' }}
                </p>
              </div>

              <!-- Habilitar firmas en pie de página -->
              <div class="rounded-3xl p-5 sm:p-6 bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shrink-0">
                    <PencilSquareIcon class="size-5" />
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-white leading-tight">Líneas de Firma en el Documento</h3>
                    <p class="text-xs text-zinc-400 mt-0.5">
                      Imprime los espacios de firma y sello del taller a la izquierda y firma de conformidad del cliente a la derecha.
                    </p>
                  </div>
                </div>

                <label class="relative inline-flex items-center gap-3 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    v-model="form.incluirFirmas"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-black after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  <span class="text-xs font-bold text-zinc-300 peer-checked:text-yellow-400 min-w-[115px]">
                    {{ form.incluirFirmas ? 'Firmas Activas' : 'Sin Firmas' }}
                  </span>
                </label>
              </div>
            </section>

            <!-- SECCIÓN 5: ACCIÓN FINAL Y TOTAL -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/90 border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Importe Total Calculado</span>
                <span class="text-3xl sm:text-4xl font-extrabold text-yellow-400 font-mono tracking-tight">
                  {{ formatoMoneda(total) }}
                </span>
                <p class="text-xs text-zinc-500 mt-1">Precios netos sin cargos ocultos.</p>
              </div>

              <button
                type="submit"
                :disabled="cargando"
                class="h-12 sm:h-14 px-8 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-yellow-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <ArrowPathIcon v-if="cargando" class="size-5 animate-spin" />
                <ClipboardDocumentCheckIcon v-else class="size-5" />
                <span>{{ cargando ? 'Guardando Registro...' : (modoEdicion ? 'Actualizar Nota y Regenerar PDF' : 'Guardar y Generar PDF') }}</span>
              </button>
            </section>
          </form>
        </div>

        <!-- Columna Derecha: Vista Previa Digital en Tiempo Real -->
        <div class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <div class="rounded-3xl p-6 bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl ring-1 ring-yellow-500/10">
            <!-- Cabecera de la Vista Previa -->
            <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="size-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <ClipboardDocumentCheckIcon class="size-4" />
                </div>
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">Vista Previa Oficial</h3>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold tracking-wider uppercase border border-yellow-500/20">
                Borrador
              </span>
            </div>

            <!-- Fichas de Resumen -->
            <div class="space-y-3.5 text-xs">
              <div class="p-3 rounded-xl bg-zinc-950/60 border border-white/5">
                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Sucursal de Atención</span>
                <span class="font-extrabold text-white text-sm">{{ nombreTaller }}</span>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-2">
                <div class="flex justify-between">
                  <span class="text-zinc-400">Cliente:</span>
                  <span class="font-bold text-white text-right truncate max-w-[170px]">{{ form.cliente.nombre || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-400">Vehículo:</span>
                  <span class="font-bold text-yellow-400">{{ form.cliente.vehiculo || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-400">Modelo / Año:</span>
                  <span class="font-mono text-white">{{ form.cliente.modelo || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-400">Placas:</span>
                  <span class="font-mono text-white">{{ form.cliente.placas || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-zinc-400">Kilometraje:</span>
                  <span class="font-mono text-white">{{ form.cliente.kilometraje || '—' }}</span>
                </div>
              </div>

              <!-- Daños Inspeccionados en la Vista Previa -->
              <div v-if="daños.length > 0" class="p-3 rounded-xl bg-zinc-950/60 border border-white/5">
                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Daños Registrados ({{ daños.length }})
                </span>
                <ul class="space-y-1">
                  <li v-for="(daño, idx) in daños" :key="daño.id" class="flex items-center gap-2 text-zinc-300 text-[11px]">
                    <span class="size-2 rounded-full shrink-0" :style="{ backgroundColor: getColorDaño(daño.tipo) }"></span>
                    <span class="font-mono text-yellow-400">#{{ idx + 1 }}</span>
                    <span class="truncate">{{ daño.descripcion }}</span>
                  </li>
                </ul>
              </div>

              <!-- Partidas en la Vista Previa -->
              <div class="p-3 rounded-xl bg-zinc-950/60 border border-white/5">
                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Desglose de Partidas</span>
                <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <div
                    v-for="(item, idx) in form.items"
                    :key="idx"
                    class="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0"
                  >
                    <span class="truncate max-w-[160px] text-zinc-300">
                      {{ item.cantidad }}x {{ item.descripcion || 'Sin descripción' }}
                    </span>
                    <span class="font-mono font-bold text-yellow-400 shrink-0 ml-2">
                      {{ formatoMoneda(item.precio) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Total General -->
              <div class="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/15 via-yellow-600/5 to-transparent border border-yellow-500/30">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Total Oficial</span>
                  <span class="text-xl font-extrabold text-yellow-400 font-mono">{{ formatoMoneda(total) }}</span>
                </div>
                <div class="mt-2 text-[10px] flex items-center gap-1.5">
                  <CheckCircleIcon v-if="form.tieneGarantia" class="size-3.5 text-yellow-400 shrink-0" />
                  <InformationCircleIcon v-else class="size-3.5 text-zinc-500 shrink-0" />
                  <span :class="form.tieneGarantia ? 'text-yellow-400 font-bold truncate' : 'text-zinc-500 truncate'">
                    {{ form.tieneGarantia ? form.garantia : 'Sin garantía' }}
                  </span>
                </div>
                <div class="mt-1 text-[10px] flex items-center gap-1.5 text-zinc-400">
                  <PencilSquareIcon :class="form.incluirFirmas ? 'text-emerald-400' : 'text-zinc-500'" class="size-3.5 shrink-0" />
                  <span :class="form.incluirFirmas ? 'text-zinc-300' : 'text-zinc-500'">
                    {{ form.incluirFirmas ? 'Líneas de firma habilitadas' : 'Sin líneas de firma' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL DE INSPECCIÓN VISUAL DE CARROCERÍA -->
    <div
      v-if="mostrarModalDaños"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div class="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

        <!-- Encabezado del Modal -->
        <div class="flex items-start justify-between gap-4 pb-5 border-b border-white/10 mb-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Tipo Seleccionado: {{ getLabelDaño(tipoDaño) }}</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-extrabold text-white">Inspección de Carrocería</h3>
            <p class="text-xs text-zinc-400 mt-0.5">Haga clic en la silueta para marcar el punto y agregue el detalle correspondiente.</p>
          </div>
          <button
            type="button"
            @click="cancelarDaño"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <XMarkIcon class="size-6" />
          </button>
        </div>

        <!-- Contenido: Silueta + Detalle -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <!-- Silueta Interactiva -->
          <div class="lg:col-span-7 bg-zinc-950/80 rounded-2xl p-4 border border-white/5 relative">
            <div
              @click="agregarPuntoDaño"
              class="relative cursor-crosshair rounded-xl overflow-hidden min-h-64 sm:min-h-80 flex items-center justify-center bg-zinc-900/40 select-none"
            >
              <img
                src="/img/silueta.png"
                alt="Silueta del vehículo"
                class="max-w-full max-h-72 object-contain opacity-85 pointer-events-none"
              />

              <!-- Marcador de Daño Actual -->
              <div
                v-if="dañoSeleccionado"
                :style="{ left: `${dañoSeleccionado.x}%`, top: `${dañoSeleccionado.y}%` }"
                class="absolute size-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div
                  class="size-6 rounded-full border-2 border-white shadow-lg animate-pulse"
                  :style="{ backgroundColor: getColorDaño(tipoDaño) }"
                ></div>
              </div>
            </div>

            <p v-if="!dañoSeleccionado" class="text-xs text-yellow-400 mt-3 text-center font-semibold">
              Haga clic sobre la silueta para situar el punto de daño.
            </p>
          </div>

          <!-- Formulario del Punto -->
          <div class="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div>
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Descripción del Daño</label>
              <textarea
                v-model="descripcionDaño"
                rows="5"
                placeholder="Ej. Rayón superficial de 10 cm en puerta delantera derecha..."
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 p-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                @click="cancelarDaño"
                class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="guardarDaño"
                :disabled="!puedeGuardarDaño"
                class="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-md shadow-yellow-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Guardar Punto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
