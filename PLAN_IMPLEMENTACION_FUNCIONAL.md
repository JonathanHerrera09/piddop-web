# Plan de implementación funcional — nuevo panel Piddop

## Objetivo

Convertir `vibrant-module-studio` de maqueta visual a panel web funcional, conservando **sus componentes, estilos, colores, tema oscuro y experiencia responsive**. La fuente de verdad será el backend actual y, cuando exista una implementación funcional útil, se reutilizará la lógica de `../web/` en lugar de reinventarla.

No se reemplazará la maqueta por el diseño anterior. Se conectará la maqueta nueva a los datos y flujos reales de Piddop.

## Forma de trabajo

Cada fase se desarrolla y se valida por completo antes de continuar a la siguiente.

1. Implementar únicamente el alcance de la fase.
2. Probar manualmente los casos descritos en “Check de salida”.
3. Ejecutar lint, pruebas y build.
4. Corregir los hallazgos de la fase.
5. Entregar un resumen: implementado, pruebas realizadas, pendientes y riesgos.
6. Esperar autorización antes de iniciar la fase siguiente.

Los textos, pantallas y componentes visuales existentes del nuevo repositorio son la referencia de UI. La carpeta `../web/`, `../backend/` y la guía `../mds/GUIA_COMPLETA_MODULOS_WEB.md` son la referencia de comportamiento y contratos API.

---

## Fase 0 — Preparación técnica

### Implementar

- Instalar y bloquear las dependencias del repositorio nuevo.
- Hacer que `lint`, `test` y `build` funcionen localmente.
- Crear configuración de entorno sin secretos versionados:
  - `VITE_API_URL`
  - `VITE_SOCKET_URL` (si no se deriva de la URL API)
  - `VITE_GOOGLE_MAPS_API_KEY`, solo para los módulos de mapas.
- Crear la capa base de comunicación HTTP inspirada en `../web/src/services/http.ts`:
  - URL base.
  - JSON y `FormData`.
  - encabezado `Authorization: Bearer`.
  - encabezado `X-Company-Id` cuando aplique.
  - normalización de errores API.
  - renovación de token y cierre de sesión cuando el backend responda 401/403.
- Crear tipos de dominio y servicios por módulo; no dejar llamadas `fetch` dispersas dentro de los componentes visuales.
- Configurar el manejo común de carga, error, vacío y reintento usando los estilos actuales.
- Añadir pruebas mínimas de servicios y rutas protegidas.

### Check de salida

- `npm run lint`, `npm run test` y `npm run build` terminan correctamente.
- El proyecto inicia con variables de entorno válidas y muestra un error entendible si faltan.
- Ninguna clave privada, token ni contraseña queda expuesta en el cliente ni en Git.

---

## Fase 1 — Login, sesión y acceso protegido

### Implementar

- Reemplazar el login demo de `src/routes/index.tsx` por la autenticación real del backend.
- Validar correo, contraseña, estado de carga y mensajes que devuelve la API.
- Persistir la sesión de manera compatible con la aplicación web vigente.
- Cargar el usuario autenticado, su rol y sus empresas/membresías.
- Implementar restauración de sesión al refrescar la página.
- Implementar cierre de sesión real e invalidación de la sesión local.
- Proteger `/panel`: una persona no autenticada debe volver a `/`.
- Mantener el diseño actual de la pantalla de acceso, incluido tema claro/oscuro y mostrar/ocultar contraseña.
- Crear páginas públicas separadas para Términos, Privacidad, Autorización de datos, Eliminar cuenta y Soporte; enlazarlas desde el login.

### Check de salida

- Credenciales válidas entran al panel; inválidas muestran el error del servidor sin navegar.
- Recargar conserva una sesión válida.
- Sesión vencida o inválida lleva al login sin dejar datos privados visibles.
- “Cerrar sesión” realmente impide volver al panel con Atrás/recarga.
- Las rutas legales y Soporte abren correctamente.

---

## Fase 2 — Shell del panel, roles y empresa activa

### Implementar

- Conectar el sidebar y encabezado de `src/routes/panel.tsx` al usuario autenticado.
- Eliminar perfiles ficticios (`admin`, `catalog`, `services`) como fuente de datos; calcular el perfil desde rol, empresa activa y tipo de empresa reales.
- Mostrar solo las opciones permitidas por rol y permisos:
  - Super Admin.
  - Owner / Manager.
  - Cook.
  - Professional.
  - Catalog Manager.
  - Support.
  - Roles personalizados.
- Cargar el selector de empresa solo para usuarios con varias empresas permitidas.
- Guardar/cambiar empresa activa y recargar los módulos bajo ese contexto.
- Integrar tema persistente, menú móvil, Escape, overlay y breadcrumb actuales.
- Implementar estados globales de carga/error y botón Reintentar.

### Check de salida

- Un Super Admin ve únicamente su menú administrativo.
- Una cuenta de empresa solo ve los módulos de su empresa y permisos.
- Cambiar empresa actualiza el menú y los datos cargados.
- Un usuario sin permiso no puede abrir un módulo por URL ni invocar una acción protegida.
- La navegación es usable en móvil y escritorio.

---

## Fase 3 — Resúmenes, notificaciones y tiempo real

### Implementar

- Conectar Resumen general y Resumen del negocio a sus endpoints reales.
- Conectar Mis calificaciones / Calificaciones de plataforma, filtros y métricas.
- Conectar el buzón de notificaciones: listado, búsqueda, marcar una y marcar todas leídas.
- Integrar WebSocket reutilizando la estrategia de `../web/src/services/socket.ts`.
- Mostrar avisos de pedido/cita en el panel con los toasts y estilos de la nueva vista.
- Implementar activación real de sonido y permiso de notificaciones de navegador; guardar preferencia de sonido.

### Check de salida

- Las métricas coinciden con la respuesta del backend.
- Una notificación nueva llega sin recargar y actualiza el contador/lista.
- El permiso denegado de navegador se informa correctamente.
- Sonido, notificaciones y tiempo real no afectan a usuarios sin permiso ni rompen el panel si el socket se desconecta.

---

## Fase 4 — Operación de pedidos y comprobante/PDF

### Implementar

- Conectar el módulo Pedidos: listado, búsqueda, paginación, detalle y estados permitidos.
- Consultar el flujo de estados real antes de mostrar botones (aceptar, preparar, listo, rechazar, etc.).
- Añadir confirmación con motivo cuando el flujo lo requiera.
- Reemplazar los datos de muestra y actualizaciones locales por respuestas de la API.
- Crear una vista de comprobante de pedido basada en el estilo visual actual de la maqueta: logo, empresa, fecha, artículos, modificadores, dirección, cobro, totales y estado.
- Hacer que Imprimir use una hoja de impresión limpia de esa vista.
- Si el backend ya ofrece PDF, enlazar Descarga a ese archivo. Si no lo ofrece, definir con el usuario si se genera desde backend o mediante una librería cliente; no simular “PDF” con `window.print()`.

### Check de salida

- El listado muestra pedidos reales de la empresa activa.
- Un cambio de estado permitido persiste al recargar y el no permitido devuelve un error claro.
- Detalle y totales reflejan exactamente el pedido recibido.
- El comprobante se imprime sin menú/sidebar y el botón PDF descarga un PDF válido, no solo abre el diálogo de impresión.
- Una notificación de pedido nuevo actualiza la lista.

---

## Fase 5 — Catálogo de empresas de productos

### Implementar

- Conectar Productos: listado, búsqueda, creación, edición, activación/desactivación y eliminación según permiso.
- Conectar imágenes de productos: carga, orden y eliminación mediante `FormData`.
- Conectar ingredientes/adiciones si están habilitados para el producto.
- Conectar Variantes: opciones, selección única/múltiple, obligatoriedad, precios y límites reales que soporte la API.
- Conectar Categorías disponibles de la plataforma para formularios de producto.
- Mantener los modales, tarjetas y formularios del nuevo diseño; añadir validación y estados de guardado.

### Check de salida

- Crear, editar y eliminar un producto se refleja al recargar.
- Las imágenes llegan al servidor y se ven con URL real.
- Variantes y precios aparecen correctamente en un producto asociado.
- El menú no permite estas operaciones a Cook, Support ni roles sin permiso.

---

## Fase 6 — Empresas de servicios: citas, servicios, profesionales y horarios

### Implementar

- Conectar Citas con filtros, detalle y cambios de estado válidos.
- Conectar Servicios: CRUD, duración, precio, profesionales relacionados y estado.
- Conectar Profesionales: CRUD, foto mediante carga real, estado y servicios/asignaciones admitidos.
- Conectar Horarios por profesional: creación, edición, eliminación y validación de rangos/solapamientos que aplique el backend.
- Mantener las pantallas exclusivas para empresas de tipo `services`.

### Check de salida

- Citas, servicios, profesionales y agendas muestran datos de la empresa activa.
- Los cambios persisten tras recargar.
- La foto de profesional se carga y muestra correctamente.
- Las pantallas no aparecen para empresas de catálogo y respetan permisos de Professional.

---

## Fase 7 — Equipo, configuración del negocio y cartera

### Implementar

- Conectar Equipo: listar, crear/vincular, editar rol y estado, retirar con confirmación.
- Conectar Configuración del negocio: perfil, contacto, descripción, dirección/ubicación, logo y cobertura particular si existe.
- Integrar selector de ubicación/mapa reutilizando la lógica existente de Google Maps, pero adaptado a los estilos nuevos.
- Conectar Comisiones y cartera: métricas, filtros, movimientos y paginación.
- Mantener la restricción de cartera a Owner y Manager.

### Check de salida

- Las modificaciones del perfil y logo quedan persistidas en el backend.
- Los cambios de equipo respetan roles y no permiten retirar al propietario cuando la API lo restringe.
- Cartera no incluye el domicilio en la comisión y coincide con el backend.
- Los filtros no alteran los datos al volver a cargar o cambiar de página.

---

## Fase 8 — Administración de plataforma

### Implementar

- Empresas: búsqueda, crear, editar, comisión, activar/suspender y acceso a sus usuarios.
- Usuarios de empresas: selector de empresa, alta, edición, asignación de rol, estado y retiro.
- Clientes: búsqueda, detalle, reactivar y acciones destructivas con confirmación explícita.
- Soporte: listado y actualización de estado.
- Categorías globales: CRUD y carga de icono real.
- Cupones: CRUD, alcance, vigencia y validaciones.
- Popups y promociones: CRUD, carga de imagen, destino interno/externo y fechas.
- Domiciliarios: listado y creación con los campos admitidos por API.
- Roles y permisos: listar, editar/cargar formulario, crear, validar y eliminar roles personalizados.

### Check de salida

- Cada acción escribe/lee del backend, maneja carga/error y persiste tras recargar.
- Las acciones destructivas exigen confirmación y no eliminan ante cancelar.
- Archivos e imágenes llegan a los endpoints correspondientes.
- Los roles de sistema no se pueden eliminar y los roles personalizados respetan el contrato de permisos.

---

## Fase 9 — Liquidaciones, cobertura, Wompi y centro de correos

### Implementar

- Liquidaciones PSE: órdenes elegibles, selección de una sola empresa, previsualización, referencia, facturación, listado, PDF y envío por correo.
- Cobertura global: cargar/guardar estado, centro, zoom y polígono con editor real de Google Maps.
- Enlaces de aplicación: cargar y guardar enlaces configurables.
- Wompi: consultar y actualizar configuración con secretos enmascarados; el navegador nunca recupera ni guarda secretos reales fuera del endpoint seguro.
- Centro de correos: cargar plantillas, guardar cambios, previsualizar variables y enviar correo de prueba validado.

### Check de salida

- No se pueden liquidar órdenes de empresas distintas en una sola operación.
- El PDF de una liquidación es descargable y el envío usa el correo real configurado.
- El polígono de cobertura vuelve a cargarse idéntico después de guardar.
- Las llaves privadas de Wompi nunca aparecen en texto plano.
- Las plantillas de correo se conservan y el envío de prueba informa éxito o fallo real.

---

## Fase 10 — Calidad final, seguridad y despliegue

### Implementar

- Completar pruebas unitarias para servicios, permisos, navegación y estados críticos.
- Añadir pruebas de integración para login, pedidos, catálogo, citas y operaciones administrativas de alto riesgo.
- Revisar accesibilidad: foco, etiquetas, contraste, modales, navegación por teclado y lectores de pantalla.
- Revisar responsive en móvil, tablet y escritorio, incluyendo tablas y formularios largos.
- Optimizar carga inicial: división por rutas/módulos y carga diferida de mapas/PDF cuando proceda.
- Revisar manejo de errores, telemetría y protección contra exposición de secretos.
- Preparar `.env.example`, instrucciones de despliegue y checklist de producción.

### Check de salida

- Lint, pruebas y build pasan en un entorno limpio.
- No hay datos demo, credenciales de prueba ni endpoints falsos en producción.
- Los permisos se validan tanto en interfaz como en backend.
- El panel funciona con datos reales en los roles principales y dispositivos objetivo.

---

## Orden recomendado de ejecución

La prioridad es: **Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4**. Con eso quedará una primera versión operativa: acceso real, permisos reales, panel contextual, alertas y operación de pedidos con comprobante/PDF.

Después se puede continuar según el tipo de negocio prioritario:

- Empresas de comida/productos: Fases 5 y 7.
- Empresas de servicios: Fases 6 y 7.
- Operación de plataforma/Super Admin: Fases 8 y 9.

## Decisiones que se confirmarán antes de implementarlas

- Fuente de PDF de pedidos: endpoint del backend, nuevo endpoint de backend o generación cliente.
- Qué roles y cuentas reales usar para pruebas en ambiente de desarrollo.
- URL/credenciales de Google Maps para los editores geográficos.
- Si el repositorio nuevo se despliega de forma independiente o sustituye el despliegue actual de `web/`.
- Estrategia final para token de sesión según las capacidades actuales del backend (almacenamiento cliente o cookies seguras).
