<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  UsersIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  XMarkIcon,
  PhotoIcon,
  UserIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import TechBackground from '../components/TechBackground.vue'

const API = import.meta.env.VITE_API_URL

const usuarios = ref([])
const cargando = ref(false)
const error = ref('')
const terminoBusqueda = ref('')
const filtroRol = ref('all')
const filtroTaller = ref('all')

const roles = [
  { label: 'Todos los roles', value: 'all' },
  { label: 'Superadmins', value: 'superadmin' },
  { label: 'Administradores', value: 'admin' },
  { label: 'Técnicos', value: 'tecnico' }
]

const filteredUsuarios = computed(() => {
  const term = terminoBusqueda.value.toLowerCase().trim()
  return usuarios.value.filter(u => {
    const matchesTerm =
      !term ||
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.correo && u.correo.toLowerCase().includes(term)) ||
      (u.taller && u.taller.toLowerCase().includes(term)) ||
      (u.about && u.about.toLowerCase().includes(term))

    const userRolNormalizado = u.rol === 'empleado' ? 'tecnico' : u.rol
    const matchesRol = filtroRol.value === 'all' || u.rol === filtroRol.value || userRolNormalizado === filtroRol.value
    const matchesTaller = filtroTaller.value === 'all' || (u.taller && u.taller.toLowerCase().includes(filtroTaller.value.toLowerCase()))

    return matchesTerm && matchesRol && matchesTaller
  })
})

const totalSuperAdmins = computed(() => usuarios.value.filter(u => u.rol === 'superadmin').length)
const totalAdmins = computed(() => usuarios.value.filter(u => u.rol === 'admin').length)
const totalEmpleados = computed(() => usuarios.value.filter(u => u.rol === 'tecnico' || u.rol === 'empleado').length)

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  background: '#18181b',
  color: '#ffffff'
})

// Modal y formulario
const showModal = ref(false)
const editingId = ref(null)
const isEditing = computed(() => !!editingId.value)
const imagePreviewError = ref(false)
const cardImageErrors = ref({})

const form = ref({
  nombre: '',
  correo: '',
  contraseña: '',
  taller: 'Talisman',
  rol: 'empleado',
  about: '',
  imageUrl: '',
  imagePreview: '',
  archivoImagen: null
})

const resetForm = () => {
  form.value = {
    nombre: '',
    correo: '',
    contraseña: '',
    taller: 'Talisman',
    rol: 'empleado',
    about: '',
    imageUrl: '',
    imagePreview: '',
    archivoImagen: null
  }
  editingId.value = null
  imagePreviewError.value = false
}

const cargarUsuarios = async () => {
  try {
    cargando.value = true
    error.value = ''
    const token = localStorage.getItem('authToken')
    const { data } = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarios.value = data.usuarios || []
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.msg || 'Error al cargar usuarios'
  } finally {
    cargando.value = false
  }
}

const buildFormData = (payload) => {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (k === 'password' && v === '') return
    if (k === 'eliminarImagen' && v === 'true') {
      fd.append(k, v)
      return
    }
    if (k === 'imagen' && v) {
      fd.append(k, v)
      return
    }
    if (v !== undefined && v !== null) {
      fd.append(k, v === '' ? '' : v)
    }
  })
  return fd
}

const abrirCrear = () => {
  resetForm()
  showModal.value = true
}

const abrirEditar = (usuario) => {
  imagePreviewError.value = false
  form.value = {
    nombre: usuario.nombre,
    correo: usuario.correo,
    contraseña: '',
    taller: usuario.taller || 'Talisman',
    rol: usuario.rol || 'empleado',
    about: usuario.about || '',
    imageUrl: usuario.imageUrl || '',
    imagePreview: usuario.imageUrl || '',
    archivoImagen: null
  }
  editingId.value = usuario.id || usuario._id
  showModal.value = true
}

const cerrarModal = () => {
  showModal.value = false
  resetForm()
}

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.fire({ icon: 'error', title: 'Selecciona un archivo de imagen válido' })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.fire({ icon: 'error', title: 'El archivo excede el límite de 5MB' })
    return
  }
  imagePreviewError.value = false
  form.value.imagePreview = URL.createObjectURL(file)
  form.value.archivoImagen = file
}

const limpiarImagen = () => {
  imagePreviewError.value = false
  form.value.imagePreview = ''
  form.value.imageUrl = ''
  form.value.archivoImagen = null
}

const guardarUsuario = async () => {
  if (!form.value.nombre || !form.value.correo || !form.value.taller) {
    toast.fire({ icon: 'error', title: 'Nombre, correo y taller son requeridos' })
    return
  }
  if (!isEditing.value && !form.value.contraseña) {
    toast.fire({ icon: 'error', title: 'Contraseña requerida para registrar el usuario' })
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    const payload = {
      nombre: form.value.nombre.trim(),
      correo: form.value.correo.trim(),
      taller: form.value.taller,
      rol: form.value.rol
    }

    if (form.value.about && form.value.about.trim() !== '') {
      payload.about = form.value.about.trim()
    }

    if (form.value.contraseña && form.value.contraseña.trim() !== '') {
      payload.password = form.value.contraseña.trim()
    } else if (!isEditing.value) {
      toast.fire({ icon: 'error', title: 'Contraseña requerida' })
      return
    }

    if (form.value.archivoImagen) {
      payload.imagen = form.value.archivoImagen
    }

    if (isEditing.value && !form.value.archivoImagen && !form.value.imagePreview && !form.value.imageUrl) {
      payload.eliminarImagen = 'true'
    }

    const fd = buildFormData(payload)

    if (isEditing.value) {
      const targetId = editingId.value
      const { data } = await axios.put(`${API}/users/${targetId}`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const idx = usuarios.value.findIndex(u => (u.id || u._id) === targetId)
      if (idx !== -1) usuarios.value[idx] = data.usuario
      toast.fire({ icon: 'success', title: data.msg || 'Usuario actualizado correctamente' })
    } else {
      const { data } = await axios.post(`${API}/users`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      usuarios.value.push(data.usuario)
      toast.fire({
        icon: data.correoEnviado ? 'success' : 'info',
        title: data.correoEnviado
          ? 'Usuario registrado y notificación enviada'
          : 'Usuario registrado exitosamente'
      })
    }

    cerrarModal()
  } catch (err) {
    console.error(err)
    const mensajeError = err.response?.data?.msg || err.response?.data?.error || err.message || 'Error al guardar usuario'
    toast.fire({ icon: 'error', title: mensajeError })
  }
}

const eliminarUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: 'Confirmar eliminación',
    text: `¿Deseas revocar el acceso y eliminar la cuenta de ${usuario.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#27272a',
    confirmButtonText: 'Sí, eliminar cuenta',
    cancelButtonText: 'Cancelar',
    background: '#18181b',
    color: '#ffffff'
  })

  if (!result.isConfirmed) return

  try {
    const token = localStorage.getItem('authToken')
    await axios.delete(`${API}/users/${usuario.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarios.value = usuarios.value.filter(u => u.id !== usuario.id)
    toast.fire({ icon: 'success', title: 'Usuario eliminado' })
  } catch (err) {
    console.error(err)
    toast.fire({ icon: 'error', title: err.response?.data?.msg || 'Error al eliminar usuario' })
  }
}

const iniciales = (nombre) => {
  if (!nombre) return 'U'
  return nombre.trim().charAt(0).toUpperCase()
}

onMounted(() => {
  cargarUsuarios()
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
            <UsersIcon class="size-4" />
            <span>Administración de Cuentas y Accesos // Renault Service</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Gestión de Usuarios y Roles
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Control de credenciales, asignación de sucursales operativas y niveles de permiso técnico
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Estadísticas Rápidas -->
          <div class="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-4 shadow-xl">
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-500 block uppercase tracking-wider">Total</span>
              <span class="text-sm font-extrabold text-white font-mono">{{ usuarios.length }}</span>
            </div>
            <div class="h-8 w-px bg-white/10"></div>
            <div>
              <span class="text-[10px] font-mono font-bold text-yellow-500 block uppercase tracking-wider">Admins</span>
              <span class="text-sm font-extrabold text-yellow-400 font-mono">{{ totalAdmins }}</span>
            </div>
            <div class="h-8 w-px bg-white/10"></div>
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase tracking-wider">Técnicos</span>
              <span class="text-sm font-extrabold text-zinc-200 font-mono">{{ totalEmpleados }}</span>
            </div>
          </div>

          <!-- Botón Registrar Usuario -->
          <button
            type="button"
            @click="abrirCrear"
            class="px-4 py-2.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlusIcon class="size-4" />
            <span>Registrar Usuario</span>
          </button>

          <!-- Botón Recargar -->
          <button
            type="button"
            @click="cargarUsuarios"
            :disabled="cargando"
            class="size-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-yellow-400 flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-50"
            title="Recargar usuarios"
          >
            <ArrowPathIcon :class="['size-5', cargando ? 'animate-spin text-yellow-400' : '']" />
          </button>
        </div>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <section class="space-y-4 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-xl backdrop-blur-xl">
          <!-- Filtros de Rol y Taller -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1.5">
              <ShieldCheckIcon class="size-4 text-yellow-400" />
              <span>Rol:</span>
            </span>

            <button
              v-for="r in roles"
              :key="r.value"
              type="button"
              @click="filtroRol = r.value"
              :class="[
                filtroRol === r.value
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-950/70 text-zinc-300 hover:bg-white/5 hover:text-white border border-white/5 font-semibold',
                'px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              {{ r.label }}
            </button>

            <div class="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

            <!-- Filtro Taller -->
            <button
              type="button"
              @click="filtroTaller = filtroTaller === 'Talisman' ? 'all' : 'Talisman'"
              :class="[
                filtroTaller === 'Talisman'
                  ? 'bg-amber-500/20 text-yellow-400 border border-yellow-500/40 font-bold'
                  : 'bg-zinc-950/70 text-zinc-400 hover:text-white border border-white/5 font-medium',
                'px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              Talismán
            </button>

            <button
              type="button"
              @click="filtroTaller = filtroTaller === 'Lutecia' ? 'all' : 'Lutecia'"
              :class="[
                filtroTaller === 'Lutecia'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold'
                  : 'bg-zinc-950/70 text-zinc-400 hover:text-white border border-white/5 font-medium',
                'px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer'
              ]"
            >
              Lutecia
            </button>
          </div>

          <!-- Buscador en Vivo -->
          <div class="relative w-full lg:w-96">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              v-model="terminoBusqueda"
              type="text"
              placeholder="Buscar por nombre, correo, taller o cargo..."
              class="w-full rounded-2xl bg-zinc-950/80 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      <!-- LISTADO DE USUARIOS -->
      <section>
        <!-- Estado de Carga -->
        <div v-if="cargando" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <ArrowPathIcon class="size-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p class="text-sm font-semibold text-zinc-300">Cargando directorio de usuarios...</p>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="p-8 text-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p class="text-sm font-bold">{{ error }}</p>
          <button
            @click="cargarUsuarios"
            class="mt-3 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="filteredUsuarios.length === 0" class="p-16 text-center rounded-3xl bg-zinc-900/40 border border-white/5">
          <UsersIcon class="size-12 text-zinc-600 mx-auto mb-3" />
          <h3 class="text-base font-bold text-white">No se encontraron usuarios</h3>
          <p class="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            No hay colaboradores que coincidan con los criterios de búsqueda aplicados.
          </p>
        </div>

        <!-- Cuadrícula de Tarjetas de Usuario -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <div
            v-for="u in filteredUsuarios"
            :key="u.id"
            class="rounded-3xl p-5 sm:p-6 bg-zinc-900/80 border border-white/10 hover:border-yellow-500/40 transition-all duration-200 shadow-xl backdrop-blur-xl group relative overflow-hidden flex flex-col justify-between"
          >
            <!-- Borde superior luminoso activo al hover -->
            <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>

            <div>
              <!-- Fila Superior: Avatar + Nombre + Badges -->
              <div class="flex items-start gap-3.5 mb-4">
                <!-- Avatar -->
                <div class="size-13 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-base shrink-0 overflow-hidden relative shadow-inner group-hover:scale-105 transition-transform">
                  <img
                    v-if="u.imageUrl && !cardImageErrors[u.id]"
                    :src="u.imageUrl"
                    @error="cardImageErrors[u.id] = true"
                    class="size-full object-cover"
                    alt="avatar"
                  />
                  <span v-else>{{ iniciales(u.nombre) }}</span>
                  <!-- Indicador de estado -->
                  <span class="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="text-base font-extrabold text-white group-hover:text-yellow-400 transition-colors truncate">
                    {{ u.nombre }}
                  </h3>

                  <!-- Badges de Rol y Taller -->
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      :class="[
                        u.rol === 'superadmin'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : (u.rol === 'admin'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-zinc-800 text-zinc-300 border-white/10'),
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1'
                      ]"
                    >
                      <ShieldCheckIcon v-if="u.rol === 'superadmin' || u.rol === 'admin'" class="size-3" />
                      <WrenchScrewdriverIcon v-else class="size-3" />
                      <span>{{ u.rol === 'superadmin' ? 'Superadministrador' : (u.rol === 'admin' ? 'Administrador' : 'Técnico') }}</span>
                    </span>

                    <span
                      :class="[
                        (u.taller || '').toLowerCase().includes('lutecia')
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1'
                      ]"
                    >
                      <BuildingStorefrontIcon class="size-3" />
                      <span>{{ u.taller || 'Sin taller' }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Ficha de Datos: Correo y Descripción -->
              <div class="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2 text-xs mb-4">
                <div class="flex items-center gap-2 text-zinc-300 min-w-0">
                  <EnvelopeIcon class="size-4 text-zinc-400 shrink-0" />
                  <span class="font-mono truncate">{{ u.correo }}</span>
                </div>

                <div v-if="u.about" class="text-zinc-400 italic text-[11px] border-t border-white/5 pt-2 line-clamp-2">
                  "{{ u.about }}"
                </div>
                <div v-else class="text-zinc-500 text-[11px] italic border-t border-white/5 pt-2">
                  Sin descripción adicional
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                @click="abrirEditar(u)"
                class="flex-1 py-2 px-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PencilSquareIcon class="size-4" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                @click="eliminarUsuario(u)"
                class="py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-bold inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Eliminar usuario"
              >
                <TrashIcon class="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- MODAL DE CREACIÓN / EDICIÓN -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div class="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

        <!-- Encabezado del Modal -->
        <div class="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 flex items-center justify-center shrink-0">
              <UserPlusIcon v-if="!isEditing" class="size-5" />
              <PencilSquareIcon v-else class="size-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-wider block">
                {{ isEditing ? 'Actualización de Perfil' : 'Alta de Nuevo Colaborador' }}
              </span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-white">
                {{ isEditing ? 'Editar Usuario' : 'Registrar Usuario' }}
              </h3>
            </div>
          </div>

          <button
            type="button"
            @click="cerrarModal"
            class="size-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <XMarkIcon class="size-5" />
          </button>
        </div>

        <!-- Campos del Formulario -->
        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Nombre Completo</label>
              <input
                v-model="form.nombre"
                type="text"
                placeholder="Ej. Roberto Martínez García"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
              />
            </div>

            <!-- Correo -->
            <div>
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input
                v-model="form.correo"
                type="email"
                name="admin_user_email"
                autocomplete="off"
                placeholder="correo@taller.com"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all font-mono"
              />
            </div>

            <!-- Contraseña -->
            <div>
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Contraseña
                <span v-if="isEditing" class="text-[10px] text-zinc-400 font-normal lowercase">(vacío = mantener)</span>
              </label>
              <input
                v-model="form.contraseña"
                type="password"
                name="admin_user_new_password"
                autocomplete="new-password"
                :placeholder="isEditing ? 'Sin cambios' : 'Mínimo 6 caracteres'"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all font-mono"
              />
            </div>

            <!-- Taller -->
            <div>
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Sucursal / Taller</label>
              <select
                v-model="form.taller"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
              >
                <option value="Talisman">Taller Talismán (CDMX)</option>
                <option value="Lutecia">Taller Lutecia (EDOMEX)</option>
              </select>
            </div>

            <!-- Rol -->
            <div>
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Nivel de Rol</label>
              <select
                v-model="form.rol"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-yellow-500 outline-none transition-all cursor-pointer"
              >
                <option value="tecnico">Técnico (Talleres e historial propio)</option>
                <option value="admin">Administrador (Talleres, Historial completo y Archivos)</option>
                <option value="superadmin">Superadministrador (Control total de módulos)</option>
              </select>
            </div>

            <!-- About / Cargo -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Cargo / Descripción breve</label>
              <input
                v-model="form.about"
                type="text"
                placeholder="Ej. Mecánico en jefe / Asesor de servicio"
                class="block w-full rounded-xl bg-zinc-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all"
              />
            </div>

            <!-- Foto de Perfil -->
            <div class="sm:col-span-2 p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5">
              <label class="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Fotografía de Perfil</label>
              <div class="flex items-center gap-4">
                <div class="size-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 font-extrabold text-lg shrink-0 overflow-hidden relative">
                  <img
                    v-if="form.imagePreview && !imagePreviewError"
                    :src="form.imagePreview"
                    @error="imagePreviewError = true"
                    class="size-full object-cover"
                    alt="preview"
                  />
                  <PhotoIcon v-else class="size-6 text-zinc-500" />
                </div>

                <div class="flex items-center gap-2">
                  <label class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                    <PhotoIcon class="size-4 text-yellow-400" />
                    <span>Seleccionar Foto</span>
                    <input type="file" class="hidden" accept="image/*" @change="handleFileChange" />
                  </label>

                  <button
                    v-if="form.imagePreview || form.imageUrl"
                    type="button"
                    @click="limpiarImagen"
                    class="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 text-zinc-400 hover:text-red-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción del Modal -->
        <div class="flex items-center justify-end gap-3 pt-5 border-t border-white/10 mt-6">
          <button
            type="button"
            @click="cerrarModal"
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="guardarUsuario"
            class="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <CheckIcon class="size-4" />
            <span>{{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
