# Taller Notas - Frontend Web

## Descripcion del Sistema
Aplicacion web interactiva para la administracion operativa de talleres mecanicos especializados en vehiculos Renault. Provee un portal publico de atencion al cliente y un portal privado de gestion tecnica con interfaz de alta fidelidad, diseno oscuro avanzado y aceleracion grafica por hardware.

## Modulos y Funcionalidades Principales

### 1. Panel de Navegacion Lateral y Control de Roles
- Barra lateral dinamica que adapta los accesos directos segun el rol del usuario conectado:
  - Superadministrador: Talleres, Historial completo, Gestor de Archivos, Monitoreo de Telegram, Administracion de Usuarios y Perfil.
  - Administrador: Talleres, Historial completo, Gestor de Archivos y Perfil.
  - Tecnico: Talleres, Historial restringido a notas propias y Perfil.

### 2. Historial de Notas de Servicio y Control Financiero
- Indicador financiero en tiempo real que totaliza los montos generados por las notas registradas y calcula la sumatoria de las busquedas activas.
- Chips visuales de trazabilidad visibles para administradores que indican que usuario creo la nota y si fue modificada posteriormente.
- Filtro rapido por taller (Todos los talleres, Taller Talisman, Taller Lutecia) y buscador en vivo por cliente, modelo o placas.
- Acciones de impresion de PDF, descarga directa y edicion de notas.

### 3. Gestor de Archivos y Respaldo
- Explorador cronologico de notas organizadas por anio y mes.
- Visualizacion previa de comprobantes directamente en el navegador.
- Boton de Descarga de Respaldo ZIP que agrupa todos los archivos PDF del taller y el archivo con los datos completos de la base de datos.
- Boton de Purga de Base de Datos para el Superadministrador, protegido por un sistema de doble confirmacion que solicita escribir una palabra clave de seguridad.

### 4. Monitoreo en Tiempo Real por Telegram
- Panel para administracion del bot de alertas del sistema.
- Opcion para activar o pausar el envio de alertas automaticas.
- Boton de prueba de conexion inmediata con la aplicacion de mensajeria.
- Tarjetas informativas sobre las notificaciones de caida del servicio y el reporte diario.

### 5. Portal Publico y Cotizaciones
- Catalogo oficial de vehiculos Renault comercializados en Mexico.
- Formulario de cotizacion en linea con enlace directo a WhatsApp para atencion tecnica inmediata.
- Fondo grafico interactivo con renderizado de particulas y telemetria en tiempo real a sesenta cuadros por segundo.

## Tecnologias Utilizadas
- Vue.js 3 con Composition API.
- Vite como entorno de construccion y empaquetador rapido.
- Tailwind CSS para diseno de interfaz y adaptabilidad responsiva.
- GSAP para transiciones y animaciones fluidas.
- HTML5 Canvas para renderizado acelerado de particulas graficas.
- Vue Router para gestion de rutas y navegacion tipo SPA.
- Pinia para administracion del estado de sesion.
- Axios para comunicacion con la API REST del backend.
- SweetAlert2 para ventanas modales y confirmaciones de seguridad.
- Heroicons para iconografia vectorial.

## Requisitos del Entorno
- Node.js version 18 o superior
- Gestor de paquetes npm o pnpm

## Instrucciones de Puesta en Marcha

1. Ingresar a la carpeta del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Archivo de configuracion de entorno:
Crear el archivo de configuracion local basandose en el archivo de ejemplo disponible en la raiz del frontend, especificando la direccion base de la API del backend.

4. Iniciar servidor de desarrollo:
```bash
pnpm run dev
```

5. Compilar para produccion:
```bash
pnpm run build
```

La compilacion colocara los archivos listos para produccion en la carpeta publica del backend para el despliegue monolitico.
