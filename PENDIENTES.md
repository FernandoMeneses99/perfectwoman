# Pendientes de Perfect Woman T

Actualizado: 7 de noviembre de 2026
Sitio en producción: https://perfectwoman.vercel.app
Repositorio: FernandoMeneses99/perfectwoman (rama `codex/whatsapp-vercel-ready`)

Los metadatos sociales por ruta ya se resuelven en el edge. Lo que sigue depende de datos, cuentas o decisiones que solo puedes tomar tú. Está ordenado por impacto: primero lo que más mueve la aguja en SEO y confianza, al final las mejoras opcionales.

---

## 1. Dominio propio y buscadores

### 1.1 Dominio
- [ ] Elegir y comprar el dominio definitivo (por ejemplo, `perfectwomant.com`).
- [ ] Añadirlo en Vercel → Project → Settings → Domains y configurar el DNS que indique Vercel.
- [ ] Mantener `perfectwoman.vercel.app` con redirección permanente (308) al dominio nuevo.
- [ ] Avisar para actualizar en el código: `src/data/site.ts` (`url`, `seoImage`), `index.html` (canonical, Open Graph, JSON-LD), `public/robots.txt`, `public/sitemap.xml` y la configuración del edge (usa `siteConfig.url`). Sin ese cambio, canonical y sitemap seguirán apuntando al dominio viejo.

### 1.2 Google Search Console
- [ ] Crear la propiedad del dominio (recomendado: propiedad de dominio con registro TXT en el DNS).
- [ ] Enviar `https://TU-DOMINIO/sitemap.xml`.
- [ ] Pedir indexación de `/`, `/reservas`, `/club-fidelidad` y `/politica-privacidad`.
- [ ] Revisar a las 1–2 semanas: Páginas, Rendimiento, Experiencia y Mejoras → Datos estructurados.
- [ ] Si Google entrega una etiqueta `google-site-verification`, pasarla para añadirla al `<head>`.

### 1.3 Bing Webmaster Tools
- [ ] Crear la cuenta e importar el sitio desde Google Search Console.
- [ ] Enviar el sitemap y revisar IndexNow si se activa más adelante.
- [ ] Si Bing entrega `msvalidate.01`, pasarla para añadirla al `<head>`.

### 1.4 Google Business Profile (clave para SEO local)
- [ ] Crear o reclamar la ficha del negocio.
- [ ] Verificarla (vídeo o postal, según lo que pida Google).
- [ ] Categoría principal: centro de estética o salón de belleza; categorías secundarias según servicios reales.
- [ ] Completar nombre, dirección, teléfono, horarios, sitio web y enlace de reservas con el mismo NAP que el sitio.
- [ ] Subir fotos reales del estudio y de trabajos.
- [ ] Cargar servicios con precios reales cuando estén confirmados.
- [ ] Responder reseñas y pedir reseñas a clientas satisfechas (con su consentimiento).

### 1.5 Analítica
- [ ] Decidir herramienta: Vercel Web Analytics (sin cookies) o Plausible. Evitar GA4 salvo que se acepte el banner de consentimiento.
- [ ] Activar la herramienta y verificar que registra visitas y eventos de reserva/WhatsApp.
- [ ] Si se usan cookies o datos personales nuevos, actualizar la política de privacidad.

### 1.6 Etiquetas de verificación
- [ ] Añadir `google-site-verification` y `msvalidate.01` al `<head>` cuando existan.

---

## 2. Datos legales y NAP

- [ ] Reunir razón social, NIT, domicilio fiscal, correo de habeas data y teléfono fijo (si existe).
- [ ] Actualizar la política de privacidad en `src/data/privacy.ts`: identidad del responsable, finalidades, retención, derechos, canal de atención y ruta de queja ante la SIC.
- [ ] Quitar la marca de "documento preliminar" cuando los datos estén completos y actualizar `privacyPolicyVersion` y `privacyPolicyUpdated`.
- [ ] Si se venden tarjetas de regalo o se formaliza el club de fidelidad, añadir términos y condiciones del programa.
- [ ] Añadir dirección, horarios y enlace a Google Maps en el pie de página y en la sección de contacto.
- [ ] Completar el JSON-LD `BeautySalon` con `streetAddress`, `postalCode`, `geo`, `hasMap` y `openingHoursSpecification`.
- [ ] Unificar el NAP en Google Business Profile, Instagram, WhatsApp Business, sitio y facturas.

---

## 3. Imagen y contenido

- [ ] **Foto real de Tathiana** para el retrato de la especialista. Hoy `siteConfig.specialistImage` usa `/images/salon.jpg` como marcador; debe ser un retrato real, vertical y con buena luz.
- [ ] **Imagen Open Graph de 1200×630**. La actual es de 512×279. Crear una portada con foto real y logo, guardarla en `public/images/`, y actualizar `siteConfig.seoImage` y las dimensiones en `index.html` y `src/lib/publicMeta.ts`.
- [ ] Confirmar precios y duraciones reales. Hoy solo "pestañas pelo a pelo" tiene `duration_verified` y `price_verified` en `true`; el resto muestra "Precio por confirmar".
- [ ] Cambiar los enlaces de servicios del pie de página para que apunten a `/reservas?servicio=<slug>` en lugar de todos a `#servicios`. Son URLs rastreables y distintas por servicio.
- [ ] Revisar el H1 de la home: "Tu mirada, tu esencia" es correcto para marca, pero podría incorporar "pestañas", "cejas" o "Bogotá" sin perder tono.
- [ ] Revisar que las 9 fotos reales se usen sin repetir la misma imagen en secciones distintas (hoy el retrato de la especialista y el hero comparten `salon.jpg`).
- [ ] Añadir una sección de preguntas frecuentes con dudas reales (precio, duración, cuidados posteriores). Si se añade, marcarla con `FAQPage` en JSON-LD.

---

## 4. Supabase y seguridad

- [ ] Activar MFA para las cuentas administradoras en Supabase Auth y enrolar el teléfono de la dueña.
- [ ] Revisar las plantillas de correo (invitación, enlace mágico, recuperación, cambio de correo) con la marca y el dominio final.
- [ ] Configurar Site URL y Redirect URLs en Authentication → URL Configuration con el dominio definitivo.
- [ ] Confirmar que en `admin_users` solo estén las personas reales; eliminar cuentas de prueba.
- [ ] Rotar la contraseña del administrador si se compartió; usar un gestor de contraseñas.
- [ ] Revisar RLS y RPC después de cualquier cambio de esquema. El público solo debe acceder por `get_public_*` y `submit_public_review`.
- [ ] Configurar backups o PITR si el plan lo permite y exportar un respaldo manual antes de cambios grandes.
- [ ] Ejecutar `pnpm test:db` con Docker Desktop activo. Hoy no se pudo correr localmente.
- [ ] Crear un segundo administrador para continuidad.

---

## 5. Panel y flujos (requieren una sesión real)

- [ ] Probar login, logout, persistencia de sesión y sesión expirada.
- [ ] CMS: editar hero, servicios, galería, testimonios y SEO; guardar; verificar la web pública y recargar.
- [ ] Roles: comprobar que `owner` ve Admins y que `admin` no puede gestionar usuarios ni configuración sensible.
- [ ] Reseñas: aprobar, rechazar, abrir enlace de invitación, enviar desde el teléfono y evitar duplicados.
- [ ] Citas: crear manual, confirmar, cancelar, reprogramar, marcar completada y no-show.
- [ ] Recordatorio de WhatsApp: abrir el enlace desde un teléfono real y verificar que el mensaje incluye nombre, servicio, fecha, hora, especialista y código.
- [ ] Reserva pública: completar el flujo con un servicio, fecha y hora reales; verificar confirmación y el límite de 3 reservas cada 10 minutos.
- [ ] Fidelidad: emitir tarjeta, sumar sellos, redimir y abrir el enlace público.
- [ ] Zona horaria: confirmar que las citas se ven en `America/Bogota` en móvil y escritorio.

---

## 6. QA y operación

- [ ] Probar en iPhone Safari y Android Chrome reales, y abrir los enlaces desde los navegadores internos de Instagram y WhatsApp.
- [ ] Ejecutar Lighthouse móvil en `/`, `/reservas` y `/club-fidelidad` (Rendimiento, Accesibilidad, Buenas prácticas y SEO).
- [ ] Verificar `/no-existe` → 404, `/reservas/` → 308, `/index.html` → 308 y `/gestion-perfectwoman` con `noindex`.
- [ ] Revisar las vistas previas sociales después de cada cambio grande: Facebook Sharing Debugger, LinkedIn Post Inspector y un chat de WhatsApp real.
- [ ] Activar alertas de Vercel y, si se quiere, Sentry para errores en producción.
- [ ] Documentar quién es dueño del dominio, Vercel, Supabase, Instagram y Google Business Profile.
- [ ] Actualizar `lastmod` en `public/sitemap.xml` cuando cambie el contenido.

---

## 7. Mejoras opcionales (post-lanzamiento)

- [ ] Prerender o SSG de `/`, `/reservas` y `/club-fidelidad` para que el HTML inicial traiga contenido, no solo metadatos.
- [ ] Páginas propias por servicio (`/servicios/pestanas-pelo-a-pelo`, etc.) para competir por cada búsqueda.
- [ ] Blog con cuidados posteriores y consejos reales (sin relleno).
- [ ] Estrategia de reseñas en Google: pedirlas por WhatsApp después de cada cita.
- [ ] Datos estructurados `Service` y `Offer` cuando los precios estén confirmados.
- [ ] Manifest e instalación como app (opcional).

---

## Lo que ya quedó resuelto

- Metadatos sociales por ruta en el edge (`api/meta.ts` + `dist/__shell.html`), para que WhatsApp, Facebook y LinkedIn vean título, descripción e imagen correctos sin ejecutar JavaScript.
- 404 real con página de marca, redirecciones de barras finales e `index.html`, sitemap al día, dimensiones de `og:image`, `twitter:image:alt` y `noindex` en admin, opiniones y tarjetas de fidelidad.
- Recordatorio de WhatsApp en citas confirmadas.
