# Perfect Woman T

Landing page y panel de gestión del estudio Perfect Woman T (Bogotá). Un solo
negocio por despliegue: no es multi-tenant.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres, Auth, RLS, RPC)
- Vercel para el hosting

## Requisitos

- Node.js 20.19 o superior (probado con Node 22 y 24)
- pnpm 10.33
- Docker Desktop solo si vas a ejecutar las pruebas SQL locales

## Configuración local

1. Instala dependencias:

   ```bash
   pnpm install
   ```

2. Crea `.env.local` a partir de `.env.example`:

   ```bash
   VITE_SUPABASE_URL=https://<proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```

   Solo se usa la clave anónima en el cliente. La service role nunca debe
   exponerse en el bundle.

3. Levanta el sitio:

   ```bash
   pnpm dev
   ```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm lint` | ESLint sobre todo el proyecto |
| `pnpm build` | Typecheck (`tsc -b`) y build de producción |
| `pnpm preview` | Sirve el build local |
| `pnpm test:db` | Pruebas SQL con Supabase local (requiere Docker) |

## Base de datos

Las migraciones viven en `supabase/migrations`. El proyecto remoto está
vinculado con `supabase link`.

```bash
supabase migration list --linked     # local vs remoto
supabase db push --linked --dry-run  # ver qué falta
supabase db push --linked            # aplicar migraciones
```

Las pruebas SQL están en `supabase/tests` y se ejecutan con
`pnpm test:db`, que necesita Docker Desktop activo.

## Contenido del sitio

El contenido público vive en la tabla `site_content` (una sola fila) y se
sirve con `get_public_site_content()`. La galería se sirve con
`get_public_gallery()`.

- `src/lib/siteContent.ts`: tipos, fallback, normalización y fetch.
- `src/components/SiteContentProvider.tsx`: carga global del contenido.
- `src/components/admin/AdminContentManager.tsx`: editor del panel.

Si Supabase no responde, el sitio usa el fallback local. El editor guarda
directamente en `site_content` bajo RLS y conserva claves desconocidas.

Las imágenes reales están en `public/images` y se referencian como
`/images/archivo.jpg`. No se deben volver a introducir URLs de demo.

## Roles y acceso

- El panel está en `/gestion-perfectwoman`.
- Roles: `owner` (gestiona administradores) y `admin`.
- La pestaña **Admins** solo aparece para el owner.
- El último owner activo no se puede desactivar ni degradar.
- El acceso se valida contra `admin_users` y RLS; no hay registro público
  de administradores.

## Reseñas

- Las clientas reciben un enlace `/opinion/:token` generado desde el panel.
- El envío exige consentimiento y guarda `consent_version`, `consent_at` y
  `consent_ip_hash`.
- Toda reseña entra como `pending` y se publica solo después de moderarla.
- La versión vigente de la política de privacidad se lee de `settings`.

## SEO y metadatos sociales

- `src/lib/publicMeta.ts` es la fuente única de títulos, descripciones y metadatos sociales por ruta (home, reservas, fidelidad, privacidad, admin, opinión y tarjeta).
- `api/meta.ts` es una Edge Function: recibe las rutas internas desde `vercel.json`, lee `dist/__shell.html` y sustituye el bloque marcado con `meta:start` / `meta:end` según la ruta. Así WhatsApp, Facebook y LinkedIn ven los metadatos correctos sin ejecutar JavaScript.
- `scripts/create-shell.mjs` corre al final de `pnpm build` y genera el shell. No edites `dist/__shell.html` a mano.
- `/__shell.html` y `/api/meta` responden con `X-Robots-Tag: noindex`.
- La home `/` sigue sirviéndose estática. Solo las rutas internas pasan por el edge.
- Al cambiar un título o una descripción, hazlo en `src/lib/publicMeta.ts`; las páginas de React lo importan para no divergir.

## Despliegue

Vercel construye con `pnpm build` y publica `dist`. Los headers de seguridad
(CSP, HSTS, `frame-ancestors`) están en `vercel.json`. Si agregas un dominio
externo de imágenes, scripts o conexiones, actualiza la CSP en el mismo cambio.

Checklist antes de publicar:

1. `pnpm lint`
2. `pnpm build`
3. `supabase migration list --linked` sin pendientes
4. Probar el panel con una sesión real
5. Revisar los headers en el preview de Vercel

## Runbook rápido

**Cambiar textos o imágenes principales:** panel → Contenido → editar →
Guardar cambios → confirmar publicación.

**Cambiar precios o duraciones:** actualizar `services` y marcar
`price_verified` / `duration_verified` solo cuando el dato esté confirmado.
Mientras no lo esté, el sitio muestra "Precio por confirmar".

**Publicar una reseña:** panel → Opiniones → aprobar o rechazar. Las
pendientes no se muestran en la landing.

**Agregar un administrador:** el usuario debe existir en Auth; después el
owner lo agrega desde la pestaña Admins.

## Datos pendientes

- Foto real de Tathiana para el retrato de la especialista (hoy se usa una
  foto del estudio).
- Razón social, NIT y domicilio para completar la política de privacidad.
