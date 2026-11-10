<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">
    <header class="bg-gray-900 shadow">
      <div class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">Usuarios</h1>
          <p class="text-sm text-gray-400">Gestión de cuentas y roles.</p>
        </div>
        <button
          @click="abrirCrear"
          class="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
        >
          + Registrar usuario
        </button>
      </div>
    </header>

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <div class="grid gap-4 sm:grid-cols-3 sm:gap-6 mb-4 sm:mb-6">
          <div class="sm:col-span-2">
            <div class="relative">
              <input
                v-model="terminoBusqueda"
                type="text"
                class="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:text-base"
                placeholder="Buscar por nombre, correo o taller"
              />
            </div>
          </div>
          <div>
            <select
              v-model="filtroRol"
              class="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:text-base"
            >
              <option v-for="rol in roles" :key="rol.value" :value="rol">{{ rol.label }}</option>
            </select>
          </div>
        </div>

        <div class="bg-gray-800/50 rounded-lg shadow overflow-hidden">
          <div v-if="cargando" class="p-6 text-center sm:p-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto sm:h-12 sm:w-12"></div>
            <p class="mt-3 text-gray-300 text-sm sm:text-base sm:mt-4">Cargando usuarios...</p>
          </div>

          <div v-else-if="error" class="p-6 text-center sm:p-8">
            <p class="text-red-400 text-sm sm:text-base">❌ {{ error }}</p>
            <button @click="cargarUsuarios" class="mt-3 bg-indigo-500 text-white px-3 py-1.5 rounded-md hover:bg-indigo-600 text-sm sm:mt-4 sm:px-4 sm:py-2 sm:text-base">
              Reintentar
            </button>
          </div>

          <div v-else>
            <ul role="list" class="divide-y divide-white/10">
              <li v-for="u in filteredUsuarios" :key="u.id" class="p-3 sm:px-4 sm:py-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <img :src="u.imageUrl || 'https://placehold.co/64x64?text=User'" class="size-12 rounded-full object-cover" alt="avatar" />
                    <div class="min-w-0 space-y-1">
                      <p class="text-sm font-semibold text-white truncate">{{ u.nombre }}</p>
                      <div class="flex items-center gap-2">
                        <span
                          :class="[
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                            u.rol === 'admin'
                              ? 'bg-blue-500/10 text-blue-300 ring-blue-600/30'
                              : 'bg-red-500/10 text-red-300 ring-red-600/30'
                          ]"
                        >
                          {{ u.rol === 'admin' ? 'Admin' : 'Empleado' }}
                        </span>
                        <span class="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-600/20">
                          {{ u.taller }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-300 truncate">{{ u.correo }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ u.about || 'Sin descripción' }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="abrirEditar(u)"
                      class="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Editar
                    </button>
                    <button
                      @click="eliminarUsuario(u)"
                      class="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <div v-if="filteredUsuarios.length === 0" class="p-6 text-center sm:p-8">
              <p class="text-gray-400 text-sm sm:text-base">No hay usuarios para mostrar.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div class="w-full max-w-2xl bg-gray-900 rounded-xl shadow-xl border border-white/10">
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p class="text-sm text-gray-400 uppercase tracking-wide">{{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}</p>
            <h3 class="text-xl font-semibold text-white">Gestión de usuarios</h3>
          </div>
          <button @click="cerrarModal" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="px-6 py-5 space-y-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-200">Nombre</label>
              <input v-model="form.nombre" type="text" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500" placeholder="Nombre completo" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-200">Correo</label>
              <input v-model="form.correo" type="email" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500" placeholder="correo@dominio.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-200">Contraseña</label>
              <input v-model="form.contraseña" type="password" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500" :placeholder="isEditing ? 'Deja vacío para no cambiar' : 'Mínimo 6 caracteres'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-200">Taller</label>
              <select v-model="form.taller" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500">
                <option value="Talisman">Talisman</option>
                <option value="Lutecia">Lutecia</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-200">Rol</label>
              <select v-model="form.rol" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500">
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-200">
                Sobre el usuario <span class="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <textarea v-model="form.about" rows="2" class="mt-2 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500" placeholder="Descripción breve (opcional)"></textarea>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-200">
              Foto de perfil <span class="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <div class="mt-3 flex items-center gap-4">
              <img v-if="form.imagePreview" :src="form.imagePreview" class="size-12 rounded-full object-cover" alt="avatar" />
              <div v-else class="size-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">Foto</div>
              <div class="flex gap-2">
                <label class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 cursor-pointer">
                  Seleccionar
                  <input type="file" class="hidden" accept="image/*" @change="handleFileChange" />
                </label>
                <button v-if="form.imagePreview || form.imageUrl" @click="limpiarImagen" class="rounded-md bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-500/20">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-gray-900/80">
          <button @click="cerrarModal" class="text-sm font-semibold text-white hover:text-gray-300">Cancelar</button>
          <button @click="guardarUsuario" class="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            {{ isEditing ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
const API = import.meta.env.VITE_API_URL

const usuarios = ref([])
const cargando = ref(false)
const error = ref('')
const terminoBusqueda = ref('')
const filtroRol = ref({ label: 'Todos', value: 'all' })
const roles = [
  { label: 'Todos', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Empleado', value: 'empleado' }
]

const filteredUsuarios = computed(() => {
  const term = terminoBusqueda.value.toLowerCase()
  return usuarios.value.filter(u => {
    const matchesTerm =
      u.nombre.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      u.taller.toLowerCase().includes(term)
    const matchesRol = filtroRol.value.value === 'all' || u.rol === filtroRol.value.value
    return matchesTerm && matchesRol
  })
})

const esAdmin = computed(() => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData).rol === 'admin' : false
  } catch (e) {
    return false
  }
})

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true
})

const showModal = ref(false)
const editingId = ref(null)
const isEditing = computed(() => !!editingId.value)
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
    // Siempre enviar campos requeridos incluso si están vacíos
    // Solo omitir undefined, null, y contraseñas vacías en edición
    if (k === 'password' && v === '') {
      // No enviar password vacía (solo en modo edición)
      return
    }
    if (k === 'eliminarImagen' && v === 'true') {
      fd.append(k, v)
      return
    }
    if (k === 'imagen' && v) {
      fd.append(k, v)
      return
    }
    if (v !== undefined && v !== null) {
      // Convertir about vacío a string vacío explícito
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
  form.value = {
    nombre: usuario.nombre,
    correo: usuario.correo,
    contraseña: '',
    taller: usuario.taller,
    rol: usuario.rol,
    about: usuario.about || '',
    imageUrl: usuario.imageUrl || '',
    imagePreview: usuario.imageUrl || '',
    archivoImagen: null
  }
  editingId.value = usuario.id
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
    toast.fire({ icon: 'error', title: 'Selecciona una imagen' })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.fire({ icon: 'error', title: 'Máx 5MB' })
    return
  }
  form.value.imagePreview = URL.createObjectURL(file)
  form.value.archivoImagen = file
}

const limpiarImagen = () => {
  form.value.imagePreview = ''
  form.value.imageUrl = ''
  form.value.archivoImagen = null
}

const guardarUsuario = async () => {
  // Validar solo campos obligatorios: nombre, correo, taller y contraseña (en creación)
  if (!form.value.nombre || !form.value.correo || !form.value.taller) {
    toast.fire({ icon: 'error', title: 'Nombre, correo y taller son obligatorios' })
    return
  }
  if (!isEditing.value && !form.value.contraseña) {
    toast.fire({ icon: 'error', title: 'Contraseña requerida para crear usuario' })
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    const payload = {
      nombre: form.value.nombre,
      correo: form.value.correo,
      taller: form.value.taller,
      rol: form.value.rol
    }

    // Agregar about solo si tiene contenido
    if (form.value.about && form.value.about.trim() !== '') {
      payload.about = form.value.about.trim()
    }

    // Solo agregar contraseña si no está vacía O si estamos creando (no editando)
    if (form.value.contraseña && form.value.contraseña.trim() !== '') {
      payload.password = form.value.contraseña  // Cambiar a 'password' sin ñ
    } else if (!isEditing.value) {
      // En creación, la contraseña ya fue validada arriba
      toast.fire({ icon: 'error', title: 'Contraseña requerida' })
      return
    }

    // Agregar imagen solo si existe
    if (form.value.archivoImagen) {
      payload.imagen = form.value.archivoImagen
    }

    if (isEditing.value && !form.value.archivoImagen && !form.value.imagePreview && !form.value.imageUrl) {
      payload.eliminarImagen = 'true'
    }

    const fd = buildFormData(payload)

    if (isEditing.value) {
      const { data } = await axios.put(`${API}/users/${editingId.value}`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const idx = usuarios.value.findIndex(u => u.id === editingId.value)
      if (idx !== -1) usuarios.value[idx] = data.usuario
      toast.fire({ icon: 'success', title: 'Usuario actualizado' })
    } else {
      const { data } = await axios.post(`${API}/users`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      usuarios.value.push(data.usuario)
      toast.fire({
        icon: data.correoEnviado ? 'success' : 'warning',
        title: data.correoEnviado
          ? 'Usuario creado y correo enviado'
          : 'Usuario creado, pero el correo no se pudo enviar'
      })
    }

    cerrarModal()
  } catch (err) {
    console.error(err)
    toast.fire({ icon: 'error', title: err.response?.data?.msg || 'Error al guardar' })
  }
}

const eliminarUsuario = async (usuario) => {
  const confirm = await Swal.fire({
    title: 'Eliminar usuario',
    text: `¿Eliminar a ${usuario.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })
  if (!confirm.isConfirmed) return

  try {
    const token = localStorage.getItem('authToken')
    await axios.delete(`${API}/users/${usuario.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarios.value = usuarios.value.filter(u => u.id !== usuario.id)
    toast.fire({ icon: 'success', title: 'Usuario eliminado' })
  } catch (err) {
    console.error(err)
    toast.fire({ icon: 'error', title: err.response?.data?.msg || 'Error al eliminar' })
  }
}

onMounted(() => {
  cargarUsuarios()
})
</script>
