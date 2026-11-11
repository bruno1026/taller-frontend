<script setup>
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const usuario = ref(null)
const imageError = ref(false)

const navigation = [
  { name: 'Talleres', href: '/seleccion-taller', roles: null },
  { name: 'Historial', href: '/historial', roles: null },
  { name: 'Usuarios', href: '/usuarios', roles: ['admin'] }
]

const cargarUsuario = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      usuario.value = JSON.parse(userData)
    } catch (e) {
      usuario.value = null
    }
  } else {
    usuario.value = null
  }
}

watch(() => usuario.value?.imageUrl, () => {
  imageError.value = false
})

watch(() => route.fullPath, () => {
  cargarUsuario()
})

onMounted(() => {
  cargarUsuario()
  window.addEventListener('storage', cargarUsuario)
  window.addEventListener('user-updated', cargarUsuario)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', cargarUsuario)
  window.removeEventListener('user-updated', cargarUsuario)
})

const esAdmin = computed(() => usuario.value?.rol === 'admin')

const nombreUsuario = computed(() => {
  return usuario.value?.nombre || 'Personal del Taller'
})

const primerNombre = computed(() => {
  const nombre = usuario.value?.nombre || 'Usuario'
  return nombre.trim().split(' ')[0]
})

const inicialUsuario = computed(() => {
  const nombre = usuario.value?.nombre || 'U'
  return nombre.trim().charAt(0).toUpperCase()
})

const rolEtiqueta = computed(() => {
  if (usuario.value?.rol === 'admin') return 'Administrador'
  if (usuario.value?.rol === 'empleado') return 'Técnico Especialista'
  return 'Personal Autorizado'
})

const isCurrentRoute = (href) => {
  return route.path === href || route.path.startsWith(href + '/')
}

const cerrarSesion = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <Disclosure as="header" class="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/90 border-b border-white/10 transition-colors" v-slot="{ open }">
    <div class="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14 h-16 sm:h-20 flex items-center justify-between gap-4">
      <!-- 1. Marca y Logotipo Oficial Renault -->
      <div class="flex items-center min-w-0">
        <a
          @click.prevent="router.push('/seleccion-taller')"
          class="group flex items-center gap-3 sm:gap-3.5 cursor-pointer select-none focus:outline-none"
          aria-label="Inicio del Portal"
        >
          <div class="size-10 sm:size-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 sm:size-6 fill-black">
              <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
            </svg>
          </div>
          <div class="flex flex-col text-left min-w-0">
            <span class="text-white font-extrabold tracking-tight text-sm sm:text-base leading-tight truncate">
              Servicio Mecánico<span class="hidden sm:inline"> Especializado</span>
            </span>
            <span class="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide truncate">
              Portal de Gestión Interna
            </span>
          </div>
        </a>
      </div>

      <!-- 2. Navegación Principal (Desktop) -->
      <nav class="hidden md:flex items-center gap-1.5 lg:gap-2">
        <button
          v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
          :key="item.name"
          type="button"
          @click="router.push(item.href)"
          :class="[
            isCurrentRoute(item.href)
              ? 'bg-yellow-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
              : 'text-zinc-300 hover:text-yellow-400 hover:bg-white/5 font-semibold',
            'h-10 px-4 inline-flex items-center justify-center rounded-xl text-sm transition-all duration-150 cursor-pointer whitespace-nowrap leading-none active:scale-[0.97]'
          ]"
        >
          {{ item.name }}
        </button>
      </nav>

      <!-- 3. Sección de Perfil y Acciones de Usuario (Desktop) -->
      <div class="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
        <!-- Saludo e Identificación -->
        <div class="flex flex-col text-right min-w-0">
          <span class="text-xs sm:text-sm font-bold text-white leading-tight truncate max-w-[160px]">
            {{ primerNombre }}
          </span>
          <span class="text-[10px] sm:text-[11px] font-semibold text-yellow-400 tracking-wider uppercase">
            {{ rolEtiqueta }}
          </span>
        </div>

        <!-- Menú Desplegable de Usuario -->
        <Menu as="div" class="relative">
          <MenuButton
            class="relative flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 cursor-pointer transition-transform active:scale-95"
            aria-label="Menú de usuario"
          >
            <div class="size-10 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center shadow-inner text-yellow-400 font-extrabold text-sm select-none relative group">
              <img
                v-if="usuario?.imageUrl && !imageError"
                :src="usuario.imageUrl"
                @error="imageError = true"
                class="size-full object-cover"
                alt="Avatar"
              />
              <span v-else>{{ inicialUsuario }}</span>
              <!-- Indicador de estado en línea -->
              <span class="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
            </div>
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems class="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-zinc-900/95 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl border border-white/10 focus:outline-none">
              <!-- Cabecera del Menú -->
              <div class="px-3 py-2.5 border-b border-white/10 mb-1">
                <p class="text-sm font-bold text-white truncate">{{ nombreUsuario }}</p>
                <p class="text-xs text-zinc-400 truncate mt-0.5">{{ usuario?.correo || 'Sin correo registrado' }}</p>
                <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheckIcon class="size-3" />
                  <span>{{ rolEtiqueta }}</span>
                </div>
              </div>

              <!-- Opción: Tu Perfil -->
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  @click="router.push('/profile')"
                  :class="[
                    active ? 'bg-white/10 text-white' : 'text-zinc-300',
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer'
                  ]"
                >
                  <UserIcon class="size-4 text-yellow-400 shrink-0" />
                  <span>Tu Perfil</span>
                </button>
              </MenuItem>

              <!-- Opción: Ver Sitio Público -->
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  @click="router.push('/')"
                  :class="[
                    active ? 'bg-white/10 text-white' : 'text-zinc-300',
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer'
                  ]"
                >
                  <ArrowTopRightOnSquareIcon class="size-4 text-zinc-400 shrink-0" />
                  <span>Ver Sitio Público</span>
                </button>
              </MenuItem>

              <div class="h-px bg-white/10 my-1"></div>

              <!-- Opción: Cerrar Sesión -->
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  @click="cerrarSesion"
                  :class="[
                    active ? 'bg-red-500/20 text-red-300' : 'text-red-400 hover:bg-red-500/10',
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer'
                  ]"
                >
                  <ArrowLeftOnRectangleIcon class="size-4 shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>

      <!-- 4. Botón Menú Móvil -->
      <div class="flex md:hidden items-center gap-2">
        <DisclosureButton
          class="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          aria-label="Abrir menú"
        >
          <Bars3Icon v-if="!open" class="size-6 text-zinc-300" />
          <XMarkIcon v-else class="size-6 text-yellow-400" />
        </DisclosureButton>
      </div>
    </div>

    <!-- Panel Móvil Desplegable -->
    <DisclosurePanel class="md:hidden border-t border-white/10 bg-zinc-950/98 backdrop-blur-xl px-4 py-4 space-y-3">
      <!-- Datos del usuario móvil -->
      <div class="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3">
        <div class="size-11 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-base shrink-0 overflow-hidden relative">
          <img
            v-if="usuario?.imageUrl && !imageError"
            :src="usuario.imageUrl"
            @error="imageError = true"
            class="size-full object-cover"
            alt="Avatar"
          />
          <span v-else>{{ inicialUsuario }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold text-white truncate">{{ nombreUsuario }}</div>
          <div class="text-xs text-zinc-400 truncate">{{ usuario?.correo || 'Colaborador de Taller' }}</div>
          <div class="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider mt-0.5">{{ rolEtiqueta }}</div>
        </div>
      </div>

      <!-- Enlaces de navegación móvil -->
      <div class="space-y-1">
        <DisclosureButton
          v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
          :key="item.name"
          as="button"
          type="button"
          @click="router.push(item.href)"
          :class="[
            isCurrentRoute(item.href)
              ? 'bg-yellow-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
              : 'text-zinc-300 hover:bg-white/5 hover:text-yellow-400 font-semibold',
            'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors text-left'
          ]"
        >
          <span>{{ item.name }}</span>
          <span v-if="isCurrentRoute(item.href)" class="size-2 rounded-full bg-black"></span>
        </DisclosureButton>
      </div>

      <div class="h-px bg-white/10 my-2"></div>

      <!-- Opciones de cuenta móvil -->
      <div class="space-y-1">
        <DisclosureButton
          as="button"
          type="button"
          @click="router.push('/profile')"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
        >
          <UserIcon class="size-4 text-yellow-400 shrink-0" />
          <span>Tu Perfil</span>
        </DisclosureButton>

        <DisclosureButton
          as="button"
          type="button"
          @click="router.push('/')"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
        >
          <ArrowTopRightOnSquareIcon class="size-4 text-zinc-400 shrink-0" />
          <span>Ver Sitio Público</span>
        </DisclosureButton>

        <DisclosureButton
          as="button"
          type="button"
          @click="cerrarSesion"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
        >
          <ArrowLeftOnRectangleIcon class="size-4 shrink-0" />
          <span>Cerrar Sesión</span>
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
