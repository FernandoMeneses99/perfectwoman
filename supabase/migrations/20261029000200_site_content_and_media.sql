set search_path = public, extensions;

create table public.site_content (
  id boolean primary key default true,
  version integer not null default 1,
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_singleton_check check (id = true),
  constraint site_content_version_check check (version >= 1),
  constraint site_content_object_check check (jsonb_typeof(content) = 'object'),
  constraint site_content_size_check check (pg_column_size(content) <= 262144)
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  badge text,
  image_url text not null,
  image_alt text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint gallery_items_title_check check (length(btrim(title)) between 2 and 120),
  constraint gallery_items_subtitle_check check (subtitle is null or length(subtitle) <= 160),
  constraint gallery_items_badge_check check (badge is null or length(badge) <= 60),
  constraint gallery_items_image_url_check check (image_url ~ '^https?://'),
  constraint gallery_items_image_alt_check check (length(btrim(image_alt)) between 4 and 200),
  constraint gallery_items_sort_order_check check (sort_order >= 0)
);

alter table public.services
add column image_url text,
add column image_alt text,
add column featured boolean not null default false,
add constraint services_image_url_check check (image_url is null or image_url ~ '^https?://'),
add constraint services_image_alt_check check (image_alt is null or length(image_alt) between 4 and 200);

alter table public.professionals
add column photo_url text,
add column photo_alt text,
add column role text,
add column bio text,
add column quote text,
add column instagram text,
add constraint professionals_photo_url_check check (photo_url is null or photo_url ~ '^https?://'),
add constraint professionals_photo_alt_check check (photo_alt is null or length(photo_alt) between 4 and 200),
add constraint professionals_role_check check (role is null or length(role) <= 80),
add constraint professionals_bio_check check (bio is null or length(bio) <= 2000),
add constraint professionals_quote_check check (quote is null or length(quote) <= 500),
add constraint professionals_instagram_check check (instagram is null or instagram ~ '^https?://');

create or replace function public.bump_site_content_version()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.content is distinct from old.content then
    new.version := old.version + 1;
  end if;

  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;

  return new;
end;
$$;

create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

create trigger site_content_bump_version
before update on public.site_content
for each row execute function public.bump_site_content_version();

create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

insert into public.site_content (id, content)
values (
  true,
  $content${
    "brand": {
      "name": "PERFECT WOMAN T",
      "descriptor": "ESTUDIO DE MIRADA & BELLEZA · BOGOTÁ",
      "location": "Bogotá, Colombia",
      "description": "Estudio de mirada y belleza en Bogotá. Pestañas, cejas, lifting, depilación y cuidado facial con precisión visagista."
    },
    "contact": {
      "whatsapp": "https://wa.me/573024090623",
      "instagram": "https://www.instagram.com/perfectwoman_t/",
      "email": "fernandomenesesda@gmail.com",
      "phone": "+57 302 409 0623"
    },
    "hero": {
      "eyebrow": "Más de 5 años de experiencia · Bogotá, Colombia",
      "title": "Tu mirada,",
      "titleAccent": "tu esencia",
      "description": "Realza tu belleza con servicios profesionales de pestañas y cejas. Arquitectura visagista de alta precisión y bienestar estético en el corazón de Bogotá.",
      "primaryCta": "Reservar cita",
      "secondaryCta": "Explorar Servicios",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAiyEk9eF-JhghldRMvR0Mh0sbFU24ty78Kuc3Kzaz2JGnQXcMxyZxONy1uJsr2m6RZmv0-y477EtpOLL8rg2U4KuKqZyXsiJS8FLPI55xfVF8k7767MK4BkSbLMPdkQPsrBbUHjj8BUno4YjsSK_Os0lwwF7ySk2w7ewge7hIPHjZ7UvTRG6E_vsB0umLlstn0I5nEsB4gCt2i4KdbVNPurvRUZeBSfhNpZp8fZt80",
      "imageAlt": "Retrato editorial de mujer con cejas esculpidas y extensiones de pestañas",
      "badge": "Atelier Bogotá",
      "cardTitle": "Edición Couture",
      "year": "2025"
    },
    "metrics": [
      { "value": "+5", "label": "Años de experiencia" },
      { "value": "Bogotá", "label": "Colombia" }
    ],
    "services": {
      "eyebrow": "Portafolio Esencial",
      "title": "Especialidades del Estudio",
      "description": "Tratamientos diseñados para armonizar y potenciar la expresión natural de tu rostro con proporciones arquitectónicas."
    },
    "specialist": {
      "eyebrow": "Filosofía Visagista",
      "title": "Conoce a tu Especialista",
      "description": "Más de cinco años de experiencia en servicios de pestañas y cejas en Bogotá. Cada persona puede consultar las opciones disponibles según su estilo.",
      "name": "Tathiana",
      "role": "Fundadora & Master Artist",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBDRoGVbG16zJEU9wDdZK7rtC165VVuHs0DHFf5HdZw8uRoVe8VVqa8CSblZDeiZt-09lDpVF9AFnLFK-VKQx5OOuX6FC0l93_MBbR6MDv3hY-XF45tfqhqQwfGtdI0d8yhXLSpzHyqfa_0UrLmtbhZeswuA-s6nnF80oYd7EB2u5yzjuj6RKJscNKwQIneyxTggGpEsrS_XuCFqiGzocEvUk3XJ1VtRnzh7766r6Ah",
      "imageAlt": "Retrato de la master artist en estudio",
      "quote": "Cada mirada tiene su propia arquitectura; mi misión es resaltar tu belleza única sin perder tu esencia natural.",
      "quoteAuthor": "Master Artist Tathiana · Bogotá",
      "highlights": [
        {
          "title": "Información del servicio",
          "description": "Consulta por Instagram los materiales y protocolos vigentes del servicio."
        },
        {
          "title": "Servicios del estudio",
          "description": "Pestañas, cejas, depilación, lifting y cuidado de la piel."
        }
      ]
    },
    "gallery": {
      "eyebrow": "Portafolio Fotográfico",
      "title": "Galería Editorial de Resultados",
      "description": "Miradas reales transformadas con precisión artesanal en nuestro atelier de Bogotá."
    },
    "testimonials": {
      "eyebrow": "Opiniones",
      "title": "Experiencias de clientas",
      "description": "Las opiniones se comparten con autorización de sus autoras.",
      "emptyText": "Espacio reservado para opiniones autorizadas"
    },
    "bookingCta": {
      "eyebrow": "Reservas en línea · Bogotá, Colombia",
      "title": "Reserva tu próxima cita",
      "description": "Elige tu servicio, fecha y hora en pocos pasos. Confirmamos tu cita por WhatsApp.",
      "primaryCta": "Reservar cita",
      "secondaryCta": "Ver servicios",
      "note": "Tu cita queda pendiente hasta que la confirmemos por WhatsApp. También puedes escribirnos si prefieres agendar por chat."
    },
    "footer": {
      "tagline": "Estudio de mirada y belleza",
      "description": "Servicios de pestañas, cejas, depilación, lifting y cuidado de la piel en Bogotá.",
      "services": ["Pestañas", "Cejas", "Depilación", "Lifting", "Cuidado de la piel"],
      "note": "Precios y duraciones vigentes al momento de la reserva. Consulta cualquier cambio por WhatsApp o Instagram."
    },
    "seo": {
      "title": "Perfect Woman T | Pestañas, cejas y belleza en Bogotá",
      "description": "Estudio de mirada y belleza en Bogotá. Reserva pestañas, cejas, lifting, depilación y cuidado facial con precisión visagista.",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAiyEk9eF-JhghldRMvR0Mh0sbFU24ty78Kuc3Kzaz2JGnQXcMxyZxONy1uJsr2m6RZmv0-y477EtpOLL8rg2U4KuKqZyXsiJS8FLPI55xfVF8k7767MK4BkSbLMPdkQPsrBbUHjj8BUno4YjsSK_Os0lwwF7ySk2w7ewge7hIPHjZ7UvTRG6E_vsB0umLlstn0I5nEsB4gCt2i4KdbVNPurvRUZeBSfhNpZp8fZt80"
    },
    "theme": {
      "primary": "#120E14",
      "secondary": "#9E3A67",
      "accent": "#FDACCD",
      "background": "#FFF7FA",
      "surface": "#FFF7FA",
      "text": "#211920",
      "muted": "#4A454A",
      "border": "#CCC4CA",
      "onPrimary": "#FFFFFF",
      "onSecondary": "#FFFFFF"
    },
    "layout": {
      "order": ["hero", "metrics", "services", "specialist", "gallery", "testimonials", "booking"],
      "hidden": []
    }
  }$content$::jsonb
)
on conflict (id) do nothing;

insert into public.gallery_items (
  slug,
  title,
  subtitle,
  badge,
  image_url,
  image_alt,
  sort_order
)
values
  (
    'pestanas-clasicas-1-1',
    'Pestañas Clásicas 1:1',
    'Efecto Seda',
    'Curva D / 0.15',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAqvZ70npqn_ctTv3LdtGpLGDGIATiPuIGToWV4Y9xgDmuLF8zK4-jMdBaELF_VPKI0Avx0f5lXVTNV4sORIo4GmtvQ3oXhGG46OrCauI03esOblZqJu4U2PsAGX_yqCElKtRkS6U00EA1sb0hKOVUNJJvSHR5OWiQtg0nEowDufvEhNMT2L0HQ3g4guDufdZHBRL2Q36B7Izp9WzqRL2dYamKdt5cCB0fQzQWkKlWe',
    'Pestañas clásicas aplicadas pelo a pelo',
    1
  ),
  (
    'cejas-efecto-sombra',
    'Cejas Efecto Sombra',
    'Henna Orgánica',
    'Visagismo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPqg75o4YBb8aJcM33tGKXPUirEZuHUeU-i-21xzxCHhKX8MY2RVP-jumoO0_5_B9kZnIjItU4f_3yN8KBrQyFwVZQgSVrjvOA28kvbgjWiDJcCYfPkn4nhYxU_A1B943WQ6GG74cwpN9zRGH7yrc9yrlCvMKb6GQLUjOLmg3m9qxO5JuAeQkKb5Z22k762_MGzo6iVhXoJnPzPQiy8QF2nLoi8HnIB9B349s_mpi3',
    'Cejas diseñadas con efecto sombra',
    2
  ),
  (
    'lifting-natural',
    'Lifting Natural',
    'Queratina Pura',
    'Verificado',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAhscrOLscd3-IWFgI5ep6FQf_5aqPwH0ydllmiA1cM8WZGeuNj2AjBjvRlABtv8zsezV8ztZtCQJ960CD0keUex9tyu2qeC-U1d-XVfoeXBNyOuui08oTxSQooDaL205pa518F9LTcLRqW6L46-r6W2MnGpWfJmCrGHUUrhfhQnc_b8Jxplo0RdCEXtZCZyLa1bsv4iDEjoDBr5TCfkkkIAf1HOeeUOluFr24r5_z',
    'Lash lifting natural con nutrición de queratina',
    3
  ),
  (
    'volumen-glam-ruso',
    'Volumen Glam Ruso',
    'Densidad 4D',
    'Favorito',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhfvZMWiYE6qYo9NNF5bs3ZkLGT1cYh_lUp-SoZff_NxCgLQgun5eLQ5EZdD2rHHgNV8dLdYBmrb0Bh4hj6ijWYV5Fa3vzvCiF6rwBICbXGdfxJ4UgPTyaYAskT63et-H5P4sOvFgsK2G7aA7UoA1CCWrhi0F4LaAvtB5xKmRMZA59SHL8zjOTZhqj3z-2ZoIPZdofLSosrjFDIFNokcGjEXXfEhr2o3fhzMb9Tgrq',
    'Volumen ruso de densidad 4D',
    4
  ),
  (
    'ambiente-del-salon',
    'Ambiente del Salón',
    'Espacio Privado',
    'Atelier',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAxddXlw1s8_F49xZTsooyQVcyEIG34pSB4UZYaMquU2rUKk5Bi56uBhR9TBsDpv_Pts9LcLE0hQRojDyQlPOd4sbl2_pjzD1JyfTaZiyIJm6ZU9DahxoYnw8sYAvT2u37XNQTFX5goU8HycVBZVaQEgj9zYtyMSpzJY8dA6Z2C-n4vzhBItWei2eWwugnXLF1_HaLU8_bgDkVCczX3qHQlCvABSiIbQW5PS13ZKiCX',
    'Ambiente privado del salón Perfect Woman T',
    5
  )
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.site_content enable row level security;
alter table public.gallery_items enable row level security;

create policy "site_content_admin_all"
on public.site_content
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gallery_items_admin_all"
on public.gallery_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "site_media_public_read" on storage.objects;
drop policy if exists "site_media_admin_insert" on storage.objects;
drop policy if exists "site_media_admin_update" on storage.objects;
drop policy if exists "site_media_admin_delete" on storage.objects;

create policy "site_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-media');

create policy "site_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-media' and public.is_admin());

create policy "site_media_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

create policy "site_media_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-media' and public.is_admin());

revoke all on table public.site_content from anon, authenticated;
revoke all on table public.gallery_items from anon, authenticated;
grant select, insert, update, delete on table public.site_content to authenticated;
grant select, insert, update, delete on table public.gallery_items to authenticated;

create or replace function public.get_public_site_content()
returns table (
  content jsonb,
  version integer,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select sc.content, sc.version, sc.updated_at
  from public.site_content sc
  where sc.id = true;
$$;

create or replace function public.get_public_gallery()
returns table (
  id uuid,
  slug text,
  title text,
  subtitle text,
  badge text,
  image_url text,
  image_alt text,
  sort_order integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    gi.id,
    gi.slug,
    gi.title,
    gi.subtitle,
    gi.badge,
    gi.image_url,
    gi.image_alt,
    gi.sort_order
  from public.gallery_items gi
  where gi.active = true
  order by gi.sort_order, gi.created_at;
$$;

revoke all on function public.bump_site_content_version() from public, anon, authenticated;
revoke all on function public.get_public_site_content() from public;
revoke all on function public.get_public_gallery() from public;

grant execute on function public.get_public_site_content() to anon, authenticated;
grant execute on function public.get_public_gallery() to anon, authenticated;
