<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon } from '@heroicons/vue/16/solid'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/20/solid'
const API = import.meta.env.VITE_API_URL

const route = useRoute()
const router = useRouter()
const taller = route.params.taller

const usuario = ref(null)

// Lista de vehículos para autocomplete
const vehiculos = [
  'LOGAN',
  'KWID',
  'KWID E-TECH',
  'STEPWAY',
  'DUSTER',
  'OROCH',
  'KOLEOS',
  'KANGOO',
  'KANGOO E-TECH',
  'CLIO',
  'MEGANE',
  'SCENIC',
  'FLUENCE',
  'PLATINA',
  'SANDERO',
  'KARDIAN',
  'ARKANA HYBRID E-TECH'
]

// Generar años del 2001 al 2026
const modelos = Array.from({ length: 26 }, (_, i) => (2001 + i).toString())

// Estados para autocomplete
const mostrarAutocomplete = ref(false)
const vehiculosFiltrados = ref([])

// Estados para la silueta del carro
const daños = ref([])
const mostrarModalDaños = ref(false)
const dañoSeleccionado = ref(null)
const descripcionDaño = ref('')
const tipoDaño = ref('rayon') // rayon, aboyadura, golpe, etc.
const puedeGuardarDaño = computed(() => {
  return Boolean(dañoSeleccionado.value && descripcionDaño.value.trim())
})

// Formulario que coincide con tu modelo de Note
const form = reactive({
  taller: taller.charAt(0).toUpperCase() + taller.slice(1), // "talisman" -> "Talisman"
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
  garantia: '',
  daños: [] // Nuevo campo para almacenar los daños
})

const mensaje = ref('')
const cargando = ref(false)
const token = ref(localStorage.getItem('authToken') || '')

// Filtrar vehículos basado en input
const filtrarVehiculos = (busqueda) => {
  if (!busqueda) {
    vehiculosFiltrados.value = []
    return
  }

  const busquedaLower = busqueda.toLowerCase()
  vehiculosFiltrados.value = vehiculos.filter(vehiculo =>
    vehiculo.toLowerCase().includes(busquedaLower)
  )
}

// Seleccionar vehículo del autocomplete
const seleccionarVehiculo = (vehiculo) => {
  form.cliente.vehiculo = vehiculo
  mostrarAutocomplete.value = false
}

// Manejar input de vehículo
const manejarInputVehiculo = (event) => {
  const valor = event.target.value
  form.cliente.vehiculo = valor
  filtrarVehiculos(valor)
  mostrarAutocomplete.value = valor.length > 0
}

// Manejar input de kilometraje - automáticamente agrega "KM"
const manejarKilometraje = (event) => {
  let valor = event.target.value

  // Remover "KM" si ya está presente para evitar duplicados
  valor = valor.replace(/\s*KM\s*$/i, '').trim()

  // Permitir solo números y comas
  valor = valor.replace(/[^\d,]/g, '')

  // Si hay valor, agregar " KM" automáticamente
  if (valor) {
    form.cliente.kilometraje = valor + ' KM'
  } else {
    form.cliente.kilometraje = ''
  }
}

// Focus en el campo de kilometraje - seleccionar solo la parte numérica
const focusKilometraje = (event) => {
  const input = event.target
  const valor = input.value.replace(/\s*KM\s*$/i, '')
  // Seleccionar solo la parte numérica para facilitar la edición
  setTimeout(() => {
    input.setSelectionRange(0, valor.length)
  }, 0)
}

// Métodos para manejar items
const agregarItem = () => {
  form.items.push({ cantidad: 1, descripcion: '', precio: 0 })
}

const eliminarItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

// Métodos para manejar daños en la silueta
const abrirModalDaños = () => {
  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = true
}

const agregarDaño = (event) => {
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

  // Limpiar formulario
  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = false
}

const eliminarDaño = (id) => {
  daños.value = daños.value.filter(daño => daño.id !== id)
  form.daños = form.daños.filter(daño => daño.id !== id)
}

const cancelarDaño = () => {
  descripcionDaño.value = ''
  dañoSeleccionado.value = null
  mostrarModalDaños.value = false
}

const getColorDaño = (tipo) => {
  const colores = {
    rayon: '#ef4444', // rojo
    aboyadura: '#f59e0b', // amarillo
    golpe: "#6003FC", // morado
    rotura: '#7c2d12', // marrón
    otro: '#6b7280' // gris
  }
  return colores[tipo] || colores.otro
}

const getLabelDaño = (tipo) => {
  const labels = {
    rayon: 'Rayón',
    aboyadura: 'Aboyadura',
    golpe: 'Golpe',
    rotura: 'Rotura',
    otro: 'Otro'
  }
  return labels[tipo] || labels.otro
}

// Calcular total automáticamente
// El precio ingresado ya es el total del item (sin multiplicar por cantidad)
const total = computed(() => {
  return form.items.reduce((sum, item) => {
    return sum + (item.precio || 0)
  }, 0)
})

// Validar formulario — ningún campo es obligatorio
// Solo verificamos que haya al menos un item con descripción para poder guardar
const formularioValido = computed(() => {
  return true
})

// Resetear formulario después de enviar
const resetearFormulario = () => {
  Object.assign(form, {
    taller: taller.charAt(0).toUpperCase() + taller.slice(1),
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
    garantia: '',
    daños: []
  })
  daños.value = []
}

// Función para formatear moneda
const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor)
}

// Modificar la función enviarNota para cargar las notas después de guardar
const enviarNota = async () => {
  try {
    cargando.value = true
    mensaje.value = ''

    const currentToken = localStorage.getItem('authToken')
    if (!currentToken) {
      mensaje.value = '❌ Sesión no encontrada. Por favor inicia sesión.'
      return
    }

    const payload = {
      ...form,
      total: total.value
    }

    const res = await axios.post(`${API}/notes`, payload, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    })

    mensaje.value = '✅ Nota guardada correctamente y PDF generado.'

    // Resetear formulario
    resetearFormulario()

  } catch (error) {
    console.error('Error:', error)
    const errorMsg = error.response?.data?.msg || error.message
    mensaje.value = `❌ Error al guardar la nota: ${errorMsg}`
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    usuario.value = JSON.parse(userData)
  }
})

const cerrarSesion = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8 min-h-screen">
    <!-- Header principal -->
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">Sistema de Notas</h2>
      <p class="mt-2 text-lg/8 text-gray-400">Complete la información para generar la nota de servicio</p>
    </div>

    <!-- FORMULARIO PRINCIPAL -->
    <div class="mx-auto mt-16 max-w-7xl">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Formulario principal -->
        <div class="lg:col-span-3">
          <form @submit.prevent="enviarNota" class="bg-gray-800/50 rounded-2xl p-6 sm:p-8 ring-1 ring-white/10">
            <!-- INFORMACIÓN DEL CLIENTE -->
            <section class="border-b border-white/10 pb-8 mb-8">
              <h2 class="text-2xl font-semibold tracking-tight text-white mb-6">👤 Información del Cliente</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Nombre completo -->
                <div>
                  <label class="block text-sm/6 font-semibold text-white mb-2">Nombre completo</label>
                  <div class="mt-2.5">
                    <input
                      v-model="form.cliente.nombre"
                      type="text"
                      placeholder="Ej: María Luisa Barranco Bazán"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <!-- Vehículo con autocomplete -->
                <div class="relative">
                  <label class="block text-sm/6 font-semibold text-white mb-2">Vehículo</label>
                  <div class="mt-2.5">
                    <input
                      v-model="form.cliente.vehiculo"
                      @input="manejarInputVehiculo"
                      @focus="mostrarAutocomplete = form.cliente.vehiculo.length > 0"
                      @blur="setTimeout(() => mostrarAutocomplete = false, 200)"
                      type="text"
                      placeholder="Ej: Sandero Stepway"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />

                    <!-- Dropdown de autocomplete -->
                    <div
                      v-if="mostrarAutocomplete && vehiculosFiltrados.length > 0"
                      class="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                      <div
                        v-for="vehiculo in vehiculosFiltrados"
                        :key="vehiculo"
                        @mousedown="seleccionarVehiculo(vehiculo)"
                        class="relative cursor-default select-none py-2 pl-3 pr-9 text-white hover:bg-indigo-600 hover:text-white"
                      >
                        <span class="block truncate">{{ vehiculo }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Modelo con select searchable -->
                <div>
                  <Listbox as="div" v-model="form.cliente.modelo">
                    <ListboxLabel class="block text-sm/6 font-semibold text-white">Modelo</ListboxLabel>
                    <div class="relative mt-2.5">
                      <ListboxButton class="grid w-full cursor-default grid-cols-1 rounded-md bg-white/5 py-2 pr-2 pl-3.5 text-left text-white outline-1 -outline-offset-1 outline-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 text-base">
                        <span class="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                          <span class="block truncate">{{ form.cliente.modelo || 'Seleccione un modelo' }}</span>
                        </span>
                        <ChevronUpDownIcon class="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400" aria-hidden="true" />
                      </ListboxButton>

                      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                        <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base outline-1 -outline-offset-1 outline-white/10 sm:text-sm">
                          <ListboxOption as="template" v-for="modelo in modelos" :key="modelo" :value="modelo" v-slot="{ active, selected }">
                            <li :class="[active ? 'bg-indigo-500 text-white' : 'text-white', 'relative cursor-default py-2 pr-9 pl-3 select-none']">
                              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ modelo }}</span>

                              <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-400', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                <CheckIcon class="size-5" aria-hidden="true" />
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
                  <label class="block text-sm/6 font-semibold text-white mb-2">Placas</label>
                  <div class="mt-2.5">
                    <input
                      v-model="form.cliente.placas"
                      type="text"
                      placeholder="Ej: NYU-477-A"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <!-- Kilometraje con KM automático -->
                <div>
                  <label class="block text-sm/6 font-semibold text-white mb-2">Kilometraje</label>
                  <div class="mt-2.5">
                    <input
                      v-model="form.cliente.kilometraje"
                      @input="manejarKilometraje"
                      @focus="focusKilometraje"
                      type="text"
                      placeholder="Ej: 312,782"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                    <p class="text-xs text-gray-400 mt-1"></p>
                  </div>
                </div>

                <!-- Servicio -->
                <div>
                  <label class="block text-sm/6 font-semibold text-white mb-2">Servicio</label>
                  <div class="mt-2.5">
                    <input
                      v-model="form.cliente.servicio"
                      type="text"
                      placeholder="Ej: Cambio de Culata"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- SILUETA DEL CARRO PARA DAÑOS -->
            <section class="border-b border-white/10 pb-8 mb-8">
              <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 class="text-2xl font-semibold tracking-tight text-white">ℹ️ Inspección Visual del Vehículo</h2>
                <div class="flex items-center gap-3 flex-wrap justify-end w-full sm:w-auto">
                  <div class="relative">
                    <select
                      v-model="tipoDaño"
                      class="bg-gray-700 text-white pl-3 pr-10 py-2 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="rayon">Rayón</option>
                      <option value="aboyadura">Aboyadura</option>
                      <option value="golpe">Golpe</option>
                      <option value="rotura">Rotura</option>
                      <option value="otro">Otro</option>
                    </select>
                    <ChevronDownIcon class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-300" aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    @click="abrirModalDaños"
                    class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-semibold"
                  >
                    ➕ Agregar daño
                  </button>
                  <button
                    type="button"
                    @click="daños = []; form.daños = []"
                    class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-semibold"
                  >
                    🗑️ Limpiar
                  </button>
                </div>
              </div>

              <div class="bg-gray-900 rounded-lg p-6 ring-1 ring-white/10">
                <p class="text-gray-300 text-sm mb-4 text-center">
                  💡 Presiona "Agregar daño" para abrir la silueta a pantalla completa, selecciona el punto y describe el detalle.
                  <span class="text-yellow-400">Primero elige el tipo de daño arriba.</span>
                </p>

                <!-- Lista de daños registrados -->
                <div v-if="daños.length > 0" class="mt-6">
                  <h4 class="text-lg font-semibold text-white mb-3">Daños Registrados:</h4>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div
                      v-for="(daño, index) in daños"
                      :key="daño.id"
                      class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-4 h-4 rounded-full"
                          :style="{ backgroundColor: getColorDaño(daño.tipo) }"
                        ></div>
                        <span class="text-white font-medium">#{{ index + 1 }}</span>
                        <span class="text-gray-300">{{ getLabelDaño(daño.tipo) }}:</span>
                        <span class="text-white">{{ daño.descripcion }}</span>
                      </div>
                      <button
                        @click="eliminarDaño(daño.id)"
                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- SERVICIOS Y PARTES -->
            <section class="border-b border-white/10 pb-8 mb-8">
              <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 class="text-2xl font-semibold tracking-tight text-white">🔧 Servicios y Partes</h2>
                <button
                  type="button"
                  @click="agregarItem"
                  class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm font-semibold"
                >
                  <span>+</span> Agregar Item
                </button>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="grid grid-cols-12 gap-4 items-start p-4 bg-white/5 rounded-lg ring-1 ring-white/10"
                >
                  <div class="col-span-3 sm:col-span-2">
                    <label class="block text-xs font-semibold text-white mb-2">Cant.</label>
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      min="1"
                      class="block w-full rounded-md bg-white/5 px-2.5 py-1.5 text-center text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                  <div class="col-span-12 sm:col-span-7">
                    <label class="block text-xs font-semibold text-white mb-2">Descripción</label>
                    <input
                      v-model="item.descripcion"
                      type="text"
                      placeholder="Descripción del servicio o parte"
                      class="block w-full rounded-md bg-white/5 px-3.5 py-1.5 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                  <div class="col-span-5 sm:col-span-2">
                    <label class="block text-xs font-semibold text-white mb-2">Precio total</label>
                    <input
                      v-model.number="item.precio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="block w-full rounded-md bg-white/5 px-2.5 py-1.5 text-right text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                    />
                  </div>
                  <div class="col-span-1 flex justify-center pt-6">
                    <button
                      v-if="form.items.length > 1"
                      type="button"
                      @click="eliminarItem(index)"
                      class="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- OBSERVACIONES Y GARANTÍA -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="text-lg font-semibold text-white mb-4">📝 Observaciones</h3>
                <textarea
                  v-model="form.observaciones"
                  rows="4"
                  placeholder="Observaciones adicionales..."
                  class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                ></textarea>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-4">🛡️ Garantía</h3>
                <input
                  v-model="form.garantia"
                  type="text"
                  placeholder="Ej: 1 mes o 1,000 km"
                  class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                />
              </div>
            </section>

            <!-- TOTAL Y BOTÓN -->
            <section class="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div class="text-center sm:text-left">
                <p class="text-2xl font-bold text-green-400">
                  Total: {{ formatoMoneda(total) }}
                </p>
                <p class="text-sm text-gray-400 mt-2">El precio de cada item es el total por esa partida</p>
              </div>
              <button
                type="submit"
                :disabled="cargando || !formularioValido"
                class="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span v-if="cargando" class="animate-spin">⏳</span>
                <span v-else>💾 Guardar Nota</span>
              </button>
            </section>
          </form>

          <!-- MENSAJE DE ESTADO -->
          <div
            v-if="mensaje"
            class="mt-6 p-4 rounded-lg text-center font-semibold"
            :class="mensaje.includes('✅')
              ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
              : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'"
          >
            {{ mensaje }}
          </div>
        </div>

        <!-- PANEL LATERAL (VISTA PREVIA) -->
        <div class="lg:col-span-1">
          <div class="bg-gray-800/50 rounded-2xl p-6 ring-1 ring-white/10 sticky top-4">
            <h3 class="text-xl font-semibold text-white mb-6">📋 Vista Previa</h3>
            <div class="space-y-4 text-sm">
              <div v-for="(campo, i) in [
                { label: 'Cliente', valor: form.cliente.nombre },
                { label: 'Vehículo', valor: form.cliente.vehiculo },
                { label: 'Modelo', valor: form.cliente.modelo },
                { label: 'Kilometraje', valor: form.cliente.kilometraje }
              ]" :key="i">
                <p class="font-semibold text-gray-300">{{ campo.label }}:</p>
                <p class="text-white">{{ campo.valor || '—' }}</p>
              </div>

              <div v-if="daños.length > 0">
                <p class="font-semibold text-gray-300 mb-2">Daños registrados:</p>
                <ul class="text-white space-y-1">
                  <li v-for="(daño, index) in daños" :key="daño.id" class="flex items-center gap-2">
                    <div
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: getColorDaño(daño.tipo) }"
                    ></div>
                    <span>#{{ index + 1 }}: {{ daño.descripcion }}</span>
                  </li>
                </ul>
              </div>

              <div>
                <p class="font-semibold text-gray-300 mb-2">Servicios:</p>
                <ul class="text-white space-y-2">
                  <li v-for="(item, index) in form.items" :key="index" class="flex justify-between items-start">
                    <span class="flex-1">{{ item.cantidad }}x {{ item.descripcion || '—' }}</span>
                    <span class="text-green-400 ml-2">{{ item.precio ? formatoMoneda(item.precio) : '—' }}</span>
                  </li>
                </ul>
              </div>

              <div class="border-t border-white/10 pt-4">
                <p class="font-bold text-lg text-green-400">Total: {{ formatoMoneda(total) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL COMPLETO PARA UBICAR Y DESCRIBIR EL DAÑO -->
    <div v-if="mostrarModalDaños" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur">
      <div class="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-5xl w-full ring-1 ring-white/10 shadow-2xl">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-400">Tipo seleccionado: <span class="text-white font-semibold">{{ getLabelDaño(tipoDaño) }}</span></p>
            <h3 class="text-2xl font-semibold text-white">Marca el punto y describe el daño</h3>
          </div>
          <button @click="cancelarDaño" class="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-900 rounded-xl p-4 ring-1 ring-white/10">
            <p class="text-gray-300 text-sm mb-3">Haz clic en la silueta para colocar el marcador. El modal usa más espacio para que en móviles se pueda señalar con precisión.</p>
            <div
              @click="agregarDaño"
              class="relative cursor-crosshair bg-gray-700 rounded-lg overflow-hidden min-h-72 flex items-center justify-center"
            >
              <img
                src="/img/silueta.png"
                alt="Silueta del vehículo"
                class="max-w-full max-h-96 object-contain opacity-90"
              />

              <div
                v-if="dañoSeleccionado"
                :style="{ left: `${dañoSeleccionado.x}%`, top: `${dañoSeleccionado.y}%` }"
                class="absolute w-7 h-7 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  class="w-7 h-7 rounded-full border-2 border-white shadow-lg animate-pulse"
                  :style="{ backgroundColor: getColorDaño(tipoDaño) }"
                ></div>
              </div>
            </div>
            <p v-if="!dañoSeleccionado" class="text-xs text-yellow-300 mt-3">Primero selecciona un punto en la silueta.</p>
          </div>

          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-sm font-semibold text-white mb-2">Descripción del daño *</label>
              <textarea
                v-model="descripcionDaño"
                rows="6"
                placeholder="Ej: Rayón profundo en puerta delantera derecha, aproximadamente 15cm"
                class="block w-full rounded-md bg-white/5 px-3.5 py-2 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-auto">
              <button
                @click="cancelarDaño"
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                @click="guardarDaño"
                :disabled="!puedeGuardarDaño"
                class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar daño
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales para mejorar la experiencia */
.transition-colors {
  transition: all 0.2s ease-in-out;
}

/* Mejora el enfoque de los inputs */
input:focus, textarea:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Estilos para el dropdown de autocomplete */
.autocomplete-dropdown {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Animación para los marcadores de daños */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Mejora el cursor para la silueta */
.cursor-crosshair {
  cursor: crosshair;
}
</style>
