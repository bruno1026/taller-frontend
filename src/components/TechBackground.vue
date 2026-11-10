<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
let animationFrameId = null
let particles = []
let mouse = { x: null, y: null, radius: 140 }
let isVisible = true

// Generador de partículas de chispa / nodos de telemetría Renault
const createParticle = (width, height) => {
  const isGolden = Math.random() > 0.35
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.6 + 0.9,
    baseAlpha: Math.random() * 0.45 + 0.25,
    alpha: 0,
    speedY: -(Math.random() * 0.4 + 0.18),
    speedX: (Math.random() - 0.5) * 0.3,
    pulseSpeed: Math.random() * 0.025 + 0.012,
    pulseOffset: Math.random() * Math.PI * 2,
    // Paleta Renault: Amarillo intenso (234, 179, 8) o Ámbar dorado (245, 158, 11)
    color: isGolden ? '234, 179, 8' : '245, 158, 11'
  }
}

const initParticles = (width, height) => {
  const isMobile = width < 768
  const count = isMobile ? 22 : 44
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(width, height))
  }
}

const setupCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = window.innerWidth
  const height = window.innerHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.scale(dpr, dpr)

  initParticles(width, height)
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const handleMouseLeave = () => {
  mouse.x = null
  mouse.y = null
}

const handleVisibilityChange = () => {
  isVisible = !document.hidden
  if (isVisible && !animationFrameId) {
    loop()
  }
}

const handleResize = () => {
  setupCanvas()
}

const loop = () => {
  if (!isVisible) {
    animationFrameId = null
    return
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = window.innerWidth
  const height = window.innerHeight

  ctx.clearRect(0, 0, width, height)

  const now = Date.now() * 0.002

  // Dibujar y actualizar partículas
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // Movimiento orgánico con leve oscilación horizontal
    p.y += p.speedY
    p.x += p.speedX + Math.sin(now * 2 + p.pulseOffset) * 0.15

    // Interacción suave con mouse
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 1.1
        p.x -= (dx / dist) * force
        p.y -= (dy / dist) * force
      }
    }

    // Reubicación suave al salir de pantalla
    if (p.y < -15) {
      p.y = height + 15
      p.x = Math.random() * width
    }
    if (p.x < -15) p.x = width + 15
    if (p.x > width + 15) p.x = -15

    // Pulsación de brillo
    p.alpha = p.baseAlpha + Math.sin(now * p.pulseSpeed * 60 + p.pulseOffset) * 0.18
    const safeAlpha = Math.max(0.1, Math.min(0.85, p.alpha))

    // 1. Halo luminoso exterior difuso
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color}, ${safeAlpha * 0.28})`
    ctx.fill()

    // 2. Núcleo brillante
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color}, ${safeAlpha})`
    ctx.fill()

    // 3. Conexiones sutiles de telemetría entre nodos cercanos (desktop)
    if (width >= 768) {
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 90) {
          const lineAlpha = (1 - dist / 90) * 0.14
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(234, 179, 8, ${lineAlpha})`
          ctx.lineWidth = 0.75
          ctx.stroke()
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(loop)
}

onMounted(() => {
  setupCanvas()
  loop()

  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('mouseleave', handleMouseLeave, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="tech-bg-container pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
    <!-- 1. Color base profundo de taller de precisión -->
    <div class="absolute inset-0 bg-[#09090b]"></div>

    <!-- 2. Textura sutil de micro-malla / fibra de carbono técnica cruzada -->
    <div class="absolute inset-0 tech-mesh-pattern opacity-60"></div>

    <!-- 3. Cuadrícula de ingeniería / Blueprint automotriz con miras técnicas (+) y puntos dorados -->
    <svg class="absolute inset-0 w-full h-full tech-grid-svg opacity-45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="automotive-blueprint-grid" width="56" height="56" patternUnits="userSpaceOnUse">
          <!-- Líneas de rejilla -->
          <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1" />
          <!-- Mira técnica en cruz central -->
          <path d="M 28 24 L 28 32 M 24 28 L 32 28" fill="none" stroke="rgba(234, 179, 8, 0.22)" stroke-width="0.75" />
          <!-- Nodo luminoso en intersección principal -->
          <circle cx="56" cy="56" r="1.4" fill="rgba(234, 179, 8, 0.55)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#automotive-blueprint-grid)" />
    </svg>

    <!-- 4. Rombo Renault geométrico en marca de agua técnica en el fondo superior -->
    <div class="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.04] transform scale-125 lg:scale-150">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 86" class="w-[520px] sm:w-[680px] lg:w-[840px] fill-yellow-400 stroke-yellow-400/40" stroke-width="0.5">
        <path d="m52.3 43-23 43H23L0 43 22.9 0h6.5L6.5 43l19.6 36.9L45.7 43 34.3 21.5l3.3-6.1L52.3 43zM42.5 0h-6.6L13.1 43l14.7 27.6 3.2-6.1L19.6 43 39.2 6l19.6 37-22.9 43h6.6l22.8-43L42.5 0z" />
      </svg>
    </div>

    <!-- 5. Haces de luz ambiental dinámicos (Spotlights con respiración suave) -->
    <!-- Halo dorado superior principal centrado en el Hero -->
    <div class="absolute -top-36 left-1/2 -translate-x-1/2 w-[76rem] h-[38rem] bg-gradient-to-b from-yellow-500/22 via-amber-600/12 to-transparent blur-[130px] rounded-full aurora-pulse"></div>
    
    <!-- Foco lateral izquierdo medio -->
    <div class="absolute top-[35%] -left-44 w-[32rem] h-[32rem] bg-yellow-500/14 blur-[130px] rounded-full float-slow"></div>
    
    <!-- Foco lateral derecho inferior -->
    <div class="absolute top-[68%] -right-44 w-[36rem] h-[36rem] bg-amber-600/14 blur-[140px] rounded-full float-reverse"></div>

    <!-- 6. Paneles / Guías de telemetría laterales técnicas (visibles en pantallas medianas y grandes) -->
    <div class="hidden xl:flex fixed left-5 top-1/4 bottom-1/4 flex-col justify-between items-center opacity-30">
      <div class="text-[9px] font-mono tracking-widest text-yellow-500 -rotate-90 origin-center whitespace-nowrap">DIAGNOSTIC SYSTEM</div>
      <div class="w-px h-32 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent"></div>
      <div class="flex flex-col gap-1.5 items-center">
        <span class="size-1 rounded-full bg-yellow-500/60"></span>
        <span class="size-1 rounded-full bg-yellow-500/30"></span>
        <span class="size-1 rounded-full bg-yellow-500/10"></span>
      </div>
      <div class="w-px h-32 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent"></div>
      <div class="text-[9px] font-mono tracking-widest text-zinc-500 -rotate-90 origin-center">RENAULT TECH</div>
    </div>

    <div class="hidden xl:flex fixed right-5 top-1/4 bottom-1/4 flex-col justify-between items-center opacity-30">
      <div class="text-[9px] font-mono tracking-widest text-zinc-500 rotate-90 origin-center">PRECISION METRICS</div>
      <div class="w-px h-32 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent"></div>
      <div class="flex flex-col gap-1.5 items-center">
        <span class="size-1 rounded-full bg-yellow-500/10"></span>
        <span class="size-1 rounded-full bg-yellow-500/30"></span>
        <span class="size-1 rounded-full bg-yellow-500/60"></span>
      </div>
      <div class="w-px h-32 bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent"></div>
      <div class="text-[9px] font-mono tracking-widest text-yellow-500 rotate-90 origin-center">CALIBRATION OK</div>
    </div>

    <!-- 7. Lienzo interactivo de partículas flotantes / chispas luminosas con aceleración GPU -->
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>

    <!-- 8. Degradado perimetral para integración perfecta con el contenido -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/80 pointer-events-none"></div>
  </div>
</template>

<style scoped>
/* Textura de micro-rejilla y fibra de carbono cruzada */
.tech-mesh-pattern {
  background-image: 
    radial-gradient(rgba(234, 179, 8, 0.12) 1px, transparent 1px),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.018) 0px, rgba(255, 255, 255, 0.018) 1px, transparent 1px, transparent 16px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.018) 0px, rgba(255, 255, 255, 0.018) 1px, transparent 1px, transparent 16px);
  background-size: 24px 24px, 32px 32px, 32px 32px;
}

/* Máscara radial suave para la cuadrícula SVG */
.tech-grid-svg {
  mask-image: radial-gradient(ellipse 90% 75% at 50% 25%, black 35%, transparent 92%);
  -webkit-mask-image: radial-gradient(ellipse 90% 75% at 50% 25%, black 35%, transparent 92%);
}

/* Animaciones de respiración e iluminación ambiental */
@keyframes auroraPulse {
  0% {
    transform: translate(-50%, 0) scale(1);
    opacity: 0.85;
  }
  50% {
    transform: translate(-50%, 2%) scale(1.06);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 0) scale(1);
    opacity: 0.85;
  }
}

@keyframes floatSlow {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(15px, -20px) scale(1.08);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes floatReverse {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-15px, 20px) scale(1.06);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

.aurora-pulse {
  animation: auroraPulse 10s ease-in-out infinite;
  will-change: transform, opacity;
}

.float-slow {
  animation: floatSlow 12s ease-in-out infinite;
  will-change: transform;
}

.float-reverse {
  animation: floatReverse 14s ease-in-out infinite;
  will-change: transform;
}
</style>
