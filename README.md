# Taller Notas - Frontend Web

## Descripcion del Sistema
Aplicacion web interactiva para taller mecanico especializado en la marca Renault. Integra un portal publico de captacion de clientes, catalogo tecnico de vehiculos atendidos en Mexico, sistema de cotizaciones conectado a WhatsApp y un panel administrativo seguro para la captura y consulta de notas de servicio.

## Para Que Sirve
- Portal Publico Informativo: Muestra la experiencia del taller, servicios de mantenimiento preventivo y correctivo, y garantias de servicio.
- Catalogo de Modelos Renault: Vista clasificada por categorias (SUVs, Compactos, Sedanes, Utilitarios, Hibridos y Electricos) con anos de comercializacion, motorizaciones y servicios recomendados.
- Solicitud de Cotizaciones: Formulario que recopila datos de contacto, modelo de vehiculo y sintomas reportados, enviando la solicitud a la base de datos y abriendo automaticamente una conversacion de WhatsApp estructurada con el asesor tecnico.
- Portal de Gestion Interna: Acceso protegido para el personal mecanico y administrativo que permite capturar notas de trabajo, calcular presupuestos y consultar el historial de servicios realizados.
- Experiencia Visual Interactiva: Fondo reactivo con aceleracion por GPU desarrollado en HTML5 Canvas con estetica automotriz y animaciones fluidas mediante GSAP.

## Tecnologias Utilizadas
- Vue.js 3: Framework progresivo utilizando Composition API y sintaxis script setup.
- Vite: Herramienta de compilacion rapida y servidor de desarrollo.
- Tailwind CSS: Framework utilitario para maquetacion responsiva y estilos visuales.
- GSAP y ScrollTrigger: Biblioteca para animaciones complejas basadas en scroll.
- HTML5 Canvas API: Motor grafico ligero para el renderizado de particulas y telemetria a 60 FPS.
- Vue Router: Manejador de rutas para navegacion tipo Single Page Application (SPA).
- Pinia: Almacen de estado centralizado para la sesion y preferencias.
- Axios: Cliente HTTP para conexion con la API del backend.
- Heroicons: Biblioteca de iconos vectoriales SVG.
- SweetAlert2: Componentes modales y alertas interactivas.

## Requisitos Previos
- Node.js version 20.19.0 o >= 22.12.0
- Gestor de paquetes npm o pnpm

## Instrucciones de Instalacion

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias del proyecto:
```bash
npm install
```

3. Crear el archivo de entorno `.env`:
Crear un archivo `.env` en la raiz del directorio `frontend` con la URL base de la API:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El aplicativo quedara disponible en `http://localhost:5174`.

5. Compilar para produccion:
```bash
npm run build
```

Los archivos optimizados y minificados se generaran en el directorio `dist/`.

6. Previsualizar compilacion de produccion:
```bash
npm run preview
```

7. Analisis de codigo y formato:
```bash
npm run lint
```
