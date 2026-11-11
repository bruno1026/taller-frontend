<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import {
  UserCircleIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  LockClosedIcon,
  KeyIcon,
  PhotoIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  CheckIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL
const router = useRouter()

const cargando = ref(false)
const fileInput = ref(null)

const formData = ref({
  nombre: '',
  correo: '',
  taller: 'Talisman',
  rol: 'empleado',
  about: '',
  imageUrl: '',
  imagePreview: '',
  nuevaContraseña: '',
  confirmarContraseña: '',
  archivoImagen: null
})

// Normaliza la URL de la imagen para servir archivos estáticos
const imageSrc = computed(() => {
  const preview = formData.value.imagePreview
  if (preview) return preview

  const stored = formData.value.imageUrl
  if (!stored) return ''

  const isAbsolute = stored.startsWith('http://') || stored.startsWith('https://')
  if (isAbsolute) return stored

  const rawBase = API || ''
  const cleanBase = rawBase.replace(/\/$/, '').replace(/\/api$/, '')
  const base = cleanBase || window.location.origin
  const normalized = stored.startsWith('/') ? stored : `/${stored}`
  return `${base}${normalized}`
})

const rolEtiqueta = computed(() => {
  if (formData.value.rol === 'admin') return 'Administrador'
  if (formData.value.rol === 'empleado') return 'Técnico Especialista'
  return 'Personal Autorizado'
})

const iniciales = (nombre) => {
  if (!nombre) return 'U'
  return nombre.trim().charAt(0).toUpperCase()
}

const cargarDatosUsuario = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const usuario = JSON.parse(userData)
      formData.value = {
        ...formData.value,
        nombre: usuario.nombre || '',
        correo: usuario.correo || '',
        taller: usuario.taller || 'Talisman',
        rol: usuario.rol || 'empleado',
        about: usuario.about || '',
        imageUrl: usuario.imageUrl || ''
      }
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    Swal.fire({
      title: 'Formato no válido',
      text: 'Por favor selecciona un archivo de imagen (PNG, JPG o JPEG).',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      title: 'Archivo demasiado grande',
      text: 'La fotografía no debe superar los 5MB.',
      icon: 'error',
      confirmButtonColor: '#eab308',
      background: '#18181b',
      color: '#ffffff'
    })
    return
  }

  formData.value.imagePreview = URL.createObjectURL(file)
  formData.value.archivoImagen = file
}

const eliminarFoto = () => {
  formData.value.imageUrl = ''
  formData.value.imagePreview = ''
  formData.value.archivoImagen = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: '#18181b',
  color: '#ffffff'
})

const actualizarPerfil = async () => {
  try {
    cargando.value = true

    // Validar contraseñas si se están cambiando
    if (formData.value.nuevaContraseña || formData.value.confirmarContraseña) {
      if (formData.value.nuevaContraseña !== formData.value.confirmarContraseña) {
        toast.fire({
          icon: 'error',
          title: 'Las contraseñas no coinciden'
        })
        cargando.value = false
        return
      }
      if (formData.value.nuevaContraseña.length < 6) {
        toast.fire({
          icon: 'error',
          title: 'La contraseña debe tener al menos 6 caracteres'
        })
        cargando.value = false
        return
      }
    }

    const token = localStorage.getItem('authToken')
    const datosActualizacion = new FormData()

    datosActualizacion.append('nombre', formData.value.nombre.trim())
    datosActualizacion.append('taller', formData.value.taller)
    datosActualizacion.append('about', formData.value.about ? formData.value.about.trim() : '')

    if (formData.value.nuevaContraseña) {
      datosActualizacion.append('contraseña', formData.value.nuevaContraseña.trim())
    }

    if (formData.value.archivoImagen) {
      datosActualizacion.append('imagen', formData.value.archivoImagen)
    }

    if (!formData.value.archivoImagen && !formData.value.imagePreview && !formData.value.imageUrl) {
      datosActualizacion.append('eliminarImagen', 'true')
    }

    const response = await fetch(`${API}/auth/actualizar-perfil`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: datosActualizacion
    })

    const result = await response.json()

    if (result.ok) {
      // Actualizar localStorage y disparar evento para refrescar Sidebar
      localStorage.setItem('user', JSON.stringify(result.usuario))
      window.dispatchEvent(new Event('user-updated'))

      formData.value.imageUrl = result.usuario?.imageUrl || ''
      formData.value.imagePreview = ''
      formData.value.archivoImagen = null
      formData.value.nuevaContraseña = ''
      formData.value.confirmarContraseña = ''

      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }

      Swal.fire({
        title: 'Perfil Actualizado',
        text: 'Tus datos de cuenta y credenciales se guardaron exitosamente.',
        icon: 'success',
        confirmButtonColor: '#eab308',
        background: '#18181b',
        color: '#ffffff'
      })
    } else {
      toast.fire({
        icon: 'error',
        title: result.msg || 'Error al actualizar el perfil'
      })
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    toast.fire({
      icon: 'error',
      title: 'Error de conexión al actualizar el perfil'
    })
  } finally {
    cargando.value = false
  }
}

const volver = () => {
  router.push('/seleccion-taller')
}

onMounted(() => {
  cargarDatosUsuario()
})
</script>

<template>
  <div class="min-h-screen text-zinc-100 relative isolate flex flex-col justify-between selection:bg-yellow-500 selection:text-black overflow-x-clip">
    <TechBackground />

    <main class="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14 py-6 sm:py-8 flex-1">
      <!-- CABECERA PRINCIPAL -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-white/10">
        <div>
          <button
            type="button"
            @click="volver"
            class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-yellow-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeftIcon class="size-4" />
            <span>Volver al Panel Principal</span>
          </button>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Mi Perfil de Usuario
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión de credenciales personales, sucursal de atención y fotografía de perfil técnico
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3 shadow-xl">
            <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-500 block uppercase tracking-wider">Estado de Cuenta</span>
              <span class="text-xs font-extrabold text-white">Activa y Autorizada</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMULARIO EN CUADRÍCULA PROPORCIONAL -->
      <form @submit.prevent="actualizarPerfil">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          <!-- COLUMNA IZQUIERDA: RESUMEN DE IDENTIDAD (4 COLS EN LG) -->
          <div class="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div class="rounded-3xl p-6 sm:p-8 bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <!-- Avatar con Indicador en Línea -->
              <div class="relative size-32 mx-auto mb-5">
                <div class="size-full rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border-2 border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-4xl overflow-hidden shadow-2xl relative">
                  <img
                    v-if="imageSrc"
                    :src="imageSrc"
                    class="size-full object-cover"
                    alt="Foto de perfil"
                  />
                  <span v-else>{{ iniciales(formData.nombre) }}</span>
                </div>

                <!-- Punto de conexión -->
                <span class="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-400 ring-4 ring-zinc-950 shadow-md"></span>
              </div>

              <!-- Nombre y Badges -->
              <h2 class="text-xl font-extrabold text-white truncate">
                {{ formData.nombre || 'Colaborador' }}
              </h2>
              <p class="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                {{ formData.correo || 'correo@taller.com' }}
              </p>

              <!-- Badges de Rol y Taller -->
              <div class="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span
                  :class="[
                    formData.rol === 'admin'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-zinc-800 text-zinc-300 border-white/10',
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border inline-flex items-center gap-1.5'
                  ]"
                >
                  <ShieldCheckIcon v-if="formData.rol === 'admin'" class="size-3.5" />
                  <WrenchScrewdriverIcon v-else class="size-3.5" />
                  <span>{{ rolEtiqueta }}</span>
                </span>

                <span
                  :class="[
                    (formData.taller || '').toLowerCase().includes('lutecia')
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border inline-flex items-center gap-1.5'
                  ]"
                >
                  <BuildingStorefrontIcon class="size-3.5" />
                  <span>{{ formData.taller || 'Talisman' }}</span>
                </span>
              </div>

              <!-- Descripción personal -->
              <div class="mt-5 p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-xs text-zinc-300 italic">
                "{{ formData.about || 'Técnico automotriz asignado a la red de servicio especializado Renault.' }}"
              </div>

              <!-- Botones de Gestión de Fotografía -->
              <div class="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2.5">
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="hidden"
                />

                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhotoIcon class="size-4 text-yellow-400" />
                  <span>{{ (formData.imagePreview || formData.imageUrl) ? 'Cambiar Foto' : 'Subir Foto' }}</span>
                </button>

                <button
                  v-if="formData.imagePreview || formData.imageUrl"
                  type="button"
                  @click="eliminarFoto"
                  class="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 text-zinc-400 hover:text-red-400 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Eliminar foto actual"
                >
                  <TrashIcon class="size-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: CAMPOS DE EDICIÓN Y SEGURIDAD (8 COLS EN LG) -->
          <div class="lg:col-span-8 space-y-6">
            <!-- SECCIÓN 1: DATOS GENERALES -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <div class="flex items-center gap-3 pb-5 border-b border-white/10 mb-6">
                <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <UserCircleIcon class="size-5" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-white">Información Personal y Taller</h2>
                  <p class="text-xs text-zinc-400">Actualiza tus datos de contacto y sucursal asignada</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <!-- Nombre -->
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input
                    v-model="formData.nombre"
                    type="text"
                    placeholder="Ej. Roberto Martínez García"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
                  />
                </div>

                <!-- Correo (No modificable) -->
                <div>
                  <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Correo Electrónico</span>
                    <span class="text-[10px] text-zinc-500 font-mono font-normal">Bloqueado</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="formData.correo"
                      type="email"
                      disabled
                      class="block w-full rounded-xl bg-zinc-950/40 border border-white/5 px-3.5 py-2.5 text-sm text-zinc-400 font-mono cursor-not-allowed outline-none"
                    />
                    <LockClosedIcon class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                  </div>
                  <p class="text-[11px] text-zinc-500 mt-1">El correo está vinculado a tu cuenta y no puede modificarse directamente.</p>
                </div>

                <!-- Taller Asignado -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Sucursal Asignada</label>
                  <select
                    v-model="formData.taller"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Talisman">Taller Talismán (CDMX)</option>
                    <option value="Lutecia">Taller Lutecia (EDOMEX)</option>
                  </select>
                  <p class="text-[11px] text-zinc-500 mt-1">Taller predeterminado para el registro y firma de notas técnicas.</p>
                </div>

                <!-- Acerca de / Cargo -->
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Acerca de ti / Cargo en taller</label>
                  <textarea
                    v-model="formData.about"
                    rows="3"
                    placeholder="Escribe un breve resumen sobre tus funciones, especialidad mecánica o cargo..."
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 p-3 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none resize-none leading-relaxed transition-all"
                  ></textarea>
                </div>
              </div>
            </section>

            <!-- SECCIÓN 2: SEGURIDAD Y CAMBIO DE CONTRASEÑA -->
            <section class="rounded-3xl p-6 sm:p-8 bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

              <div class="flex items-center gap-3 pb-5 border-b border-white/10 mb-6">
                <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <KeyIcon class="size-5" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-white">Seguridad y Acceso</h2>
                  <p class="text-xs text-zinc-400">Deja estos campos vacíos si deseas conservar tu contraseña actual</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <!-- Nueva Contraseña -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                  <input
                    v-model="formData.nuevaContraseña"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all font-mono"
                  />
                </div>

                <!-- Confirmar Contraseña -->
                <div>
                  <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Confirmar Nueva Contraseña</label>
                  <input
                    v-model="formData.confirmarContraseña"
                    type="password"
                    placeholder="Repite la contraseña"
                    class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </section>

            <!-- SECCIÓN 3: ACCIONES DE GUARDADO -->
            <section class="rounded-3xl p-6 bg-zinc-900/90 border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Confirmación de Cambios</span>
                <p class="text-xs text-zinc-500 mt-0.5">Los cambios se aplicarán de inmediato a tu sesión y barra de navegación.</p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  @click="volver"
                  class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  :disabled="cargando"
                  class="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowPathIcon v-if="cargando" class="size-4 animate-spin" />
                  <CheckIcon v-else class="size-4" />
                  <span>{{ cargando ? 'Guardando...' : 'Guardar Perfil' }}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>
