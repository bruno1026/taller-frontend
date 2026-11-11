<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UsersIcon,
  UserIcon,
  PaperAirplaneIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:collapsed', 'toggle'])

const router = useRouter()
const route = useRoute()
const usuario = ref(null)
const imageError = ref(false)
const mobileOpen = ref(false)

const navigation = [
  {
    name: 'Talleres',
    caption: 'Recepción y Notas',
    href: '/seleccion-taller',
    icon: WrenchScrewdriverIcon,
    roles: null
  },
  {
    name: 'Historial',
    caption: 'Consulta y Edición',
    href: '/historial',
    icon: ClipboardDocumentListIcon,
    roles: ['superadmin', 'admin', 'tecnico', 'empleado']
  },
  {
    name: 'Archivos',
    caption: 'Gestión Año / Mes',
    href: '/archivos',
    icon: FolderIcon,
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Telegram',
    caption: 'Bot de Monitoreo',
    href: '/telegram',
    icon: PaperAirplaneIcon,
    roles: ['superadmin'],
    badge: 'Bot'
  },
  {
    name: 'Usuarios',
    caption: 'Gestión de Cuentas',
    href: '/usuarios',
    icon: UsersIcon,
    roles: ['superadmin'],
    badge: 'Admin'
  }
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
  mobileOpen.value = false
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

const esSuperAdmin = computed(() => usuario.value?.rol === 'superadmin')
const esAdmin = computed(() => usuario.value?.rol === 'admin' || usuario.value?.rol === 'superadmin')

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
  if (usuario.value?.rol === 'superadmin') return 'Superadministrador'
  if (usuario.value?.rol === 'admin') return 'Administrador'
  if (usuario.value?.rol === 'tecnico' || usuario.value?.rol === 'empleado') return 'Técnico'
  return 'Personal Autorizado'
})

const isCurrentRoute = (href) => {
  if (href === '/seleccion-taller') {
    return route.path === '/seleccion-taller' || route.path.startsWith('/taller/')
  }
  return route.path === href || route.path.startsWith(href + '/')
}

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
  emit('toggle')
}

const irAInicio = () => {
  router.push('/seleccion-taller')
  mobileOpen.value = false
}

const navegar = (href) => {
  router.push(href)
  mobileOpen.value = false
}

const cerrarSesion = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  mobileOpen.value = false
  router.push('/login')
}
</script>

<template>
  <div>
    <!-- 1. BARRA SUPERIOR PARA MÓVIL (PANTALLAS < LG) -->
    <header class="lg:hidden sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 h-16 px-4 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="irAInicio">
        <div class="size-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
            <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
          </svg>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-white font-extrabold tracking-tight text-sm leading-tight truncate">
            Servicio Renault
          </span>
          <span class="text-[10px] text-zinc-400 font-medium tracking-wide truncate">
            Portal de Gestión
          </span>
        </div>
      </div>

      <button
        type="button"
        @click="mobileOpen = true"
        class="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-yellow-500/40 focus:outline-none transition-colors cursor-pointer"
        aria-label="Abrir menú de navegación"
      >
        <Bars3Icon class="size-6 text-zinc-200" />
      </button>
    </header>

    <!-- 2. DRAWER DESPLEGABLE PARA MÓVIL (PANTALLAS < LG) -->
    <div v-if="mobileOpen" class="lg:hidden fixed inset-0 z-50 flex">
      <!-- Telón de fondo con blur -->
      <div
        class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        @click="mobileOpen = false"
      ></div>

      <!-- Contenedor Lateral Móvil -->
      <aside class="relative w-72 max-w-[85vw] bg-zinc-950 border-r border-white/10 h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        <div>
          <!-- Cabecera Móvil con botón cerrar -->
          <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div class="flex items-center gap-3" @click="irAInicio">
              <div class="size-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
                  <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
                </svg>
              </div>
              <div>
                <span class="text-white font-extrabold text-sm block leading-tight">Renault Service</span>
                <span class="text-[10px] text-zinc-400 font-medium">Portal de Gestión</span>
              </div>
            </div>

            <button
              type="button"
              @click="mobileOpen = false"
              class="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <XMarkIcon class="size-5" />
            </button>
          </div>

          <!-- Módulos de Navegación Móvil -->
          <div class="space-y-1 mb-6">
            <div class="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500">
              Módulos Principales
            </div>

            <button
              v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
              :key="item.name"
              type="button"
              @click="navegar(item.href)"
              :class="[
                isCurrentRoute(item.href)
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white font-semibold',
                'w-full flex items-center justify-between p-3 rounded-2xl text-sm transition-all text-left cursor-pointer'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component
                  :is="item.icon"
                  :class="[
                    isCurrentRoute(item.href) ? 'text-black' : 'text-zinc-400',
                    'size-5 shrink-0'
                  ]"
                />
                <div class="min-w-0">
                  <div class="truncate leading-tight">{{ item.name }}</div>
                  <div
                    :class="[
                      isCurrentRoute(item.href) ? 'text-black/80' : 'text-zinc-500',
                      'text-[10px] truncate'
                    ]"
                  >
                    {{ item.caption }}
                  </div>
                </div>
              </div>

              <span
                v-if="item.badge"
                :class="[
                  isCurrentRoute(item.href) ? 'bg-black text-yellow-400' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                  'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0'
                ]"
              >
                {{ item.badge }}
              </span>
            </button>
          </div>

          <!-- Sistema y Cuenta Móvil -->
          <div class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500">
              Sistema
            </div>

            <button
              type="button"
              @click="navegar('/profile')"
              :class="[
                route.path === '/profile'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                'w-full flex items-center gap-3 p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer'
              ]"
            >
              <UserIcon class="size-5 text-yellow-400 shrink-0" />
              <span>Tu Perfil</span>
            </button>
          </div>
        </div>

        <!-- Pie Móvil con usuario y logout -->
        <div class="pt-4 border-t border-white/10 mt-6 space-y-3">
          <div class="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3">
            <div class="size-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-sm shrink-0 overflow-hidden relative">
              <img
                v-if="usuario?.imageUrl && !imageError"
                :src="usuario.imageUrl"
                @error="imageError = true"
                class="size-full object-cover"
                alt="Avatar"
              />
              <span v-else>{{ inicialUsuario }}</span>
              <span class="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-white truncate">{{ nombreUsuario }}</div>
              <div class="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">{{ rolEtiqueta }}</div>
            </div>
          </div>

          <button
            type="button"
            @click="cerrarSesion"
            class="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeftOnRectangleIcon class="size-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- 3. BARRA LATERAL MODERNA DE ESCRITORIO (PANTALLAS LG+) -->
    <aside
      :class="[
        'hidden lg:flex flex-col justify-between fixed inset-y-0 left-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out select-none',
        collapsed ? 'w-20 p-3' : 'w-64 p-4'
      ]"
    >
      <!-- Resplandores ambientales de fondo -->
      <div class="pointer-events-none absolute -top-24 -left-24 size-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-24 -left-24 size-48 bg-yellow-500/5 rounded-full blur-3xl"></div>

      <!-- PARTE SUPERIOR: CABECERA Y LOGO -->
      <div class="relative z-10">
        <!-- Cabecera Expandida -->
        <div v-if="!collapsed" class="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div class="flex items-center gap-3 cursor-pointer group" @click="irAInicio" title="Ir a Selección de Taller">
            <div class="size-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
                <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
              </svg>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-white font-extrabold tracking-tight text-sm leading-tight truncate group-hover:text-yellow-400 transition-colors">
                Renault Service
              </span>
              <span class="text-[10px] text-zinc-400 font-medium tracking-wide truncate">
                Portal de Gestión
              </span>
            </div>
          </div>

          <!-- Botón para contraer la barra lateral -->
          <button
            type="button"
            @click="toggleCollapse"
            class="size-8 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-yellow-500/40 flex items-center justify-center transition-colors cursor-pointer"
            title="Contraer menú lateral"
          >
            <ChevronLeftIcon class="size-4" />
          </button>
        </div>

        <!-- Cabecera Contraída -->
        <div v-else class="flex flex-col items-center pb-4 border-b border-white/10 mb-5">
          <div
            @click="irAInicio"
            class="size-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform cursor-pointer"
            title="Renault Service - Inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-5 fill-black">
              <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
            </svg>
          </div>

          <!-- Botón para expandir la barra lateral -->
          <button
            type="button"
            @click="toggleCollapse"
            class="size-7 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/40 flex items-center justify-center transition-colors cursor-pointer mt-3"
            title="Expandir menú lateral"
          >
            <ChevronRightIcon class="size-3.5" />
          </button>
        </div>

        <!-- MÓDULOS PRINCIPALES (TALLERES, HISTORIAL, USUARIOS) -->
        <div class="space-y-1.5 mb-6">
          <div
            v-if="!collapsed"
            class="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500"
          >
            Módulos Principales
          </div>

          <div
            v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
            :key="item.name"
            class="relative group"
          >
            <!-- Botón de Navegación -->
            <button
              type="button"
              @click="navegar(item.href)"
              :class="[
                isCurrentRoute(item.href)
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold shadow-lg shadow-yellow-500/25 ring-1 ring-yellow-400'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white font-semibold',
                collapsed
                  ? 'size-12 mx-auto rounded-2xl flex items-center justify-center'
                  : 'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm',
                'transition-all duration-150 cursor-pointer active:scale-98'
              ]"
            >
              <div :class="['flex items-center gap-3 min-w-0', collapsed ? 'justify-center' : '']">
                <component
                  :is="item.icon"
                  :class="[
                    isCurrentRoute(item.href) ? 'text-black' : 'text-zinc-400 group-hover:text-yellow-400',
                    'size-5 shrink-0 transition-colors'
                  ]"
                />
                <div v-if="!collapsed" class="min-w-0 text-left">
                  <div class="truncate leading-tight">{{ item.name }}</div>
                  <div
                    :class="[
                      isCurrentRoute(item.href) ? 'text-black/80 font-medium' : 'text-zinc-500 font-normal',
                      'text-[10px] truncate'
                    ]"
                  >
                    {{ item.caption }}
                  </div>
                </div>
              </div>

              <!-- Badge en modo expandido -->
              <span
                v-if="!collapsed && item.badge"
                :class="[
                  isCurrentRoute(item.href) ? 'bg-black text-yellow-400' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                  'text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0'
                ]"
              >
                {{ item.badge }}
              </span>
            </button>

            <!-- Tooltip flotante en modo contraído -->
            <div
              v-if="collapsed"
              class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 translate-x-1 group-hover:translate-x-0 flex items-center gap-2"
            >
              <span>{{ item.name }}</span>
              <span v-if="item.badge" class="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-mono font-bold">
                {{ item.badge }}
              </span>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE SISTEMA Y UTILIDADES -->
        <div class="space-y-1.5 pt-4 border-t border-white/10">
          <div
            v-if="!collapsed"
            class="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-zinc-500"
          >
            Sistema
          </div>

          <!-- Tu Perfil -->
          <div class="relative group">
            <button
              type="button"
              @click="navegar('/profile')"
              :class="[
                route.path === '/profile'
                  ? 'bg-white/10 text-white font-bold ring-1 ring-white/15'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white font-semibold',
                collapsed
                  ? 'size-12 mx-auto rounded-2xl flex items-center justify-center'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm',
                'transition-all cursor-pointer'
              ]"
            >
              <UserIcon class="size-5 text-yellow-400 shrink-0" />
              <span v-if="!collapsed" class="truncate">Tu Perfil</span>
            </button>

            <!-- Tooltip en modo contraído -->
            <div
              v-if="collapsed"
              class="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 translate-x-1 group-hover:translate-x-0"
            >
              Tu Perfil
            </div>
          </div>
        </div>
      </div>

      <!-- PARTE INFERIOR: TARJETA DE USUARIO Y LOGOUT -->
      <div class="relative z-10 pt-4 border-t border-white/10">
        <!-- Modo Expandido -->
        <div v-if="!collapsed" class="p-2.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="size-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-xs shrink-0 overflow-hidden relative">
              <img
                v-if="usuario?.imageUrl && !imageError"
                :src="usuario.imageUrl"
                @error="imageError = true"
                class="size-full object-cover"
                alt="Avatar"
              />
              <span v-else>{{ inicialUsuario }}</span>
              <span class="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
            </div>

            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate max-w-[105px] leading-tight">
                {{ primerNombre }}
              </div>
              <div class="text-[9px] text-yellow-400 font-semibold uppercase tracking-wider truncate">
                {{ rolEtiqueta }}
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="cerrarSesion"
            class="size-8 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Cerrar Sesión"
          >
            <ArrowLeftOnRectangleIcon class="size-4" />
          </button>
        </div>

        <!-- Modo Contraído -->
        <div v-else class="flex flex-col items-center gap-2">
          <div
            @click="navegar('/profile')"
            class="size-11 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-extrabold text-xs shrink-0 overflow-hidden relative cursor-pointer hover:border-yellow-400 transition-colors"
            :title="nombreUsuario + ' (' + rolEtiqueta + ')'"
          >
            <img
              v-if="usuario?.imageUrl && !imageError"
              :src="usuario.imageUrl"
              @error="imageError = true"
              class="size-full object-cover"
              alt="Avatar"
            />
            <span v-else>{{ inicialUsuario }}</span>
            <span class="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950"></span>
          </div>

          <button
            type="button"
            @click="cerrarSesion"
            class="size-8 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <ArrowLeftOnRectangleIcon class="size-4" />
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
