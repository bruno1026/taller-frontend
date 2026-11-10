<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const usuario = ref(null)
const open = ref(false)

const navigation = [
  { name: 'Talleres', href: '/seleccion-taller', current: false },
  { name: 'Historial', href: '/historial', current: false },
  { name: 'Usuarios', href: '/usuarios', current: false, roles: ['admin'] },
]

const userNavigation = [
  { name: 'Tu perfil', href: '/profile' },
  { name: 'Cerrar sesión', href: '#', action: 'logout' },
]

onMounted(() => {
  cargarUsuario()
  window.addEventListener('storage', cargarUsuario)
  window.addEventListener('user-updated', cargarUsuario)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', cargarUsuario)
  window.removeEventListener('user-updated', cargarUsuario)
})

watch(() => route.fullPath, () => {
  cargarUsuario()
})

const cargarUsuario = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    usuario.value = JSON.parse(userData)
  }
}

const esAdmin = computed(() => usuario.value?.rol === 'admin')

const nombreUsuario = computed(() => {
  return usuario.value?.nombre || 'Usuario'
})

const cerrarSesion = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

const handleUserNavigation = (item) => {
  if (item.action === 'logout') {
    cerrarSesion()
  } else if (item.href) {
    router.push(item.href)
  }
}

const isCurrentRoute = (href) => {
  return route.path === href
}
</script>

<template>
  <Disclosure as="nav" class="bg-zinc-950 border-b border-amber-500/20" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
            <div class="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="size-8 fill-yellow-500">
                <path
                  d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z"
                />
              </svg>
            </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <a
                v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
                :key="item.name"
                :href="item.href"
                @click.prevent="router.push(item.href)"
                :class="[
                  isCurrentRoute(item.href)
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-amber-300',
                  'rounded-md px-3 py-2 text-sm font-medium cursor-pointer'
                ]"
                :aria-current="isCurrentRoute(item.href) ? 'page' : undefined"
              >
                {{ item.name }}
              </a>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <!-- Mensaje de bienvenido -->
            <div class="flex items-center space-x-3 mr-4">
              <p class="text-sm text-white font-medium">
                Bienvenido, {{ nombreUsuario }}
              </p>
            </div>

            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton class="relative flex max-w-xs items-center rounded-full bg-zinc-800 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900">
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <img
                    class="size-8 rounded-full"
                    :src="usuario?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'"
                    alt=""
                  />
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-lg bg-zinc-900 py-1 shadow-lg ring-1 ring-white/10 focus:outline-none">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <a
                      @click="handleUserNavigation(item)"
                      :class="[
                        active ? 'bg-zinc-800 text-amber-300' : 'text-zinc-200',
                        'block px-4 py-2 text-sm cursor-pointer'
                      ]"
                    >
                      {{ item.name }}
                    </a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
        <div class="-mr-2 flex md:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton class="relative inline-flex items-center justify-center rounded-md bg-zinc-800 p-2 text-zinc-300 ring-1 ring-white/15 hover:bg-zinc-700 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block size-6" aria-hidden="true" />
            <XMarkIcon v-else class="block size-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
      </div>
    </div>

    <DisclosurePanel class="md:hidden border-t border-amber-500/20 bg-zinc-950/95 backdrop-blur-sm">
      <div class="space-y-1 px-3 pb-3 pt-3">
        <DisclosureButton
          v-for="item in navigation.filter(n => !n.roles || n.roles.includes(usuario?.rol))"
          :key="item.name"
          as="a"
          :href="item.href"
          @click="router.push(item.href)"
          :class="[
            isCurrentRoute(item.href)
              ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
              : 'text-zinc-300 hover:bg-zinc-800 hover:text-amber-200',
            'block rounded-md px-3 py-2 text-base font-medium cursor-pointer'
          ]"
          :aria-current="isCurrentRoute(item.href) ? 'page' : undefined"
        >
          {{ item.name }}
        </DisclosureButton>
      </div>
      <div class="border-t border-white/10 pb-3 pt-4">
        <div class="mx-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3">
          <div class="flex items-center">
          <div class="shrink-0">
            <img
              class="size-10 rounded-full"
              :src="usuario?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'"
              alt=""
            />
          </div>
          <div class="ml-3">
            <div class="text-base font-semibold leading-none text-white">{{ nombreUsuario }}</div>
            <div class="text-sm font-medium leading-none text-zinc-400 mt-1">{{ usuario?.correo }}</div>
          </div>
          </div>
        </div>
        <div class="mt-3 space-y-1 px-3">
          <DisclosureButton
            v-for="item in userNavigation"
            :key="item.name"
            as="a"
            @click="handleUserNavigation(item)"
            :href="item.href"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-amber-200 cursor-pointer"
          >
            {{ item.name }}
          </DisclosureButton>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
