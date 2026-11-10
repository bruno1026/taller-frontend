<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import Swal from 'sweetalert2'
const API = import.meta.env.VITE_API_URL

const router = useRouter()
const cargando = ref(false)
const fileInput = ref(null)

const formData = ref({
  nombre: '',
  correo: '',
  taller: '',
  about: '',
  imageUrl: '',
  imagePreview: '',
  nuevaContraseña: '',
  confirmarContraseña: '',
  archivoImagen: null
})

// Normaliza la URL de la imagen para evitar rutas relativas rotas en Vite
const imageSrc = computed(() => {
  const preview = formData.value.imagePreview
  if (preview) return preview

  const stored = formData.value.imageUrl
  if (!stored) return ''

  const isAbsolute = stored.startsWith('http://') || stored.startsWith('https://')
  if (isAbsolute) return stored

  // Si la variable trae /api lo quitamos para servir archivos estáticos sin 401
  const rawBase = API || ''
  const cleanBase = rawBase.replace(/\/$/, '').replace(/\/api$/, '')
  const base = cleanBase || window.location.origin
  const normalized = stored.startsWith('/') ? stored : `/${stored}`
  return `${base}${normalized}`
})

onMounted(() => {
  cargarDatosUsuario()
})

const cargarDatosUsuario = async () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const usuario = JSON.parse(userData)
      formData.value = {
        ...formData.value,
        nombre: usuario.nombre || '',
        correo: usuario.correo || '',
        taller: usuario.taller || '',
        about: usuario.about || '',
        imageUrl: usuario.imageUrl || ''
      }
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.')
      return
    }

    formData.value.imagePreview = URL.createObjectURL(file)
    formData.value.archivoImagen = file
  }
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
  timerProgressBar: true
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

    datosActualizacion.append('nombre', formData.value.nombre)
    datosActualizacion.append('taller', formData.value.taller)
    datosActualizacion.append('about', formData.value.about)

    if (formData.value.nuevaContraseña) {
      datosActualizacion.append('contraseña', formData.value.nuevaContraseña)
    }

    if (formData.value.archivoImagen) {
      datosActualizacion.append('imagen', formData.value.archivoImagen)
    }
    // Si se eliminó la foto y no se envía nueva, avisamos al backend
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

      // Actualizar datos en localStorage
      localStorage.setItem('user', JSON.stringify(result.usuario))
      window.dispatchEvent(new Event('user-updated'))

      // Reflejar inmediatamente la imagen/estado actualizado en la vista actual
      formData.value.imageUrl = result.usuario?.imageUrl || ''
      formData.value.imagePreview = ''
      formData.value.archivoImagen = null
      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }

      // Toast de éxito
      await toast.fire({
        icon: 'success',
        title: 'Perfil actualizado'
      })

      router.push('/')
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
      title: 'Error al actualizar el perfil'
    })
  } finally {
    cargando.value = false
  }
}

const cancelar = () => {
  router.back()
}
</script>
<template>
  <div class="min-h-full bg-gray-950">
    <header class="bg-gray-900 shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight text-white">Mi Perfil</h1>
      </div>
    </header>

    <main>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form @submit.prevent="actualizarPerfil" class="max-w-2xl">
          <div class="space-y-12">
            <!-- Información Personal -->
            <div class="border-b border-gray-700 pb-12">
              <h2 class="text-base font-semibold leading-7 text-white">Información Personal</h2>
              <p class="mt-1 text-sm leading-6 text-gray-400">Actualiza tu información personal aquí.</p>

              <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label for="nombre" class="block text-sm font-medium leading-6 text-white">Nombre</label>
                  <div class="mt-2">
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      v-model="formData.nombre"
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 px-3"
                      placeholder="Ing. Bruno"
                    />
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label for="correo" class="block text-sm font-medium leading-6 text-white">Correo electrónico</label>
                  <div class="mt-2">
                    <input
                      id="correo"
                      name="correo"
                      type="email"
                      v-model="formData.correo"
                      disabled
                      class="block w-full rounded-md border-0 bg-gray-600/50 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-white/10 sm:text-sm/6 px-3 cursor-not-allowed"
                    />
                    <p class="mt-1 text-xs text-gray-400">El correo electrónico no se puede modificar</p>
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label for="taller" class="block text-sm font-medium leading-6 text-white">Taller</label>
                  <div class="mt-2">
                    <select
                      id="taller"
                      name="taller"
                      v-model="formData.taller"
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 px-3"
                    >
                      <option value="Talisman">Talisman</option>
                      <option value="Lutecia">Lutecia</option>
                    </select>
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="about" class="block text-sm font-medium leading-6 text-white">Acerca de</label>
                  <div class="mt-2">
                    <textarea
                      name="about"
                      id="about"
                      rows="3"
                      v-model="formData.about"
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 px-3"
                      placeholder="Escribe algo sobre ti..."
                    />
                  </div>
                  <p class="mt-2 text-sm text-gray-400">Escribe algunas frases sobre ti mismo.</p>
                </div>

                <div class="col-span-full">
                  <label class="block text-sm font-medium leading-6 text-white">Foto de perfil</label>
                  <div class="mt-2 flex items-center gap-x-3">
                    <img
                      v-if="imageSrc"
                      :src="imageSrc"
                      class="size-12 rounded-full object-cover"
                      alt="Foto de perfil"
                    />
                    <div v-else class="size-12 rounded-full bg-gray-600 flex items-center justify-center">
                      <span class="text-white text-sm">Foto</span>
                    </div>
                    <input
                      type="file"
                      id="photo-upload"
                      ref="fileInput"
                      @change="handleFileUpload"
                      accept="image/*"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.fileInput.click()"
                      class="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                    >
                      {{ (formData.imagePreview || formData.imageUrl) ? 'Cambiar' : 'Subir' }}
                    </button>
                    <button
                      v-if="formData.imagePreview || formData.imageUrl"
                      type="button"
                      @click="eliminarFoto"
                      class="rounded-md bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="border-b border-gray-700 pb-12">
              <h2 class="text-base font-semibold leading-7 text-white">Cambiar Contraseña</h2>
              <p class="mt-1 text-sm leading-6 text-gray-400">Deja estos campos vacíos si no quieres cambiar la contraseña.</p>

              <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="nuevaContraseña" class="block text-sm font-medium leading-6 text-white">Nueva contraseña</label>
                  <div class="mt-2">
                    <input
                      type="password"
                      name="nuevaContraseña"
                      id="nuevaContraseña"
                      v-model="formData.nuevaContraseña"
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 px-3"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="confirmarContraseña" class="block text-sm font-medium leading-6 text-white">Confirmar contraseña</label>
                  <div class="mt-2">
                    <input
                      type="password"
                      name="confirmarContraseña"
                      id="confirmarContraseña"
                      v-model="formData.confirmarContraseña"
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 px-3"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              @click="cancelar"
              class="text-sm font-semibold leading-6 text-white hover:text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="cargando"
              class="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="cargando">Guardando...</span>
              <span v-else>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>


