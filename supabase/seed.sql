set search_path = public, extensions;

insert into public.professionals (full_name, slug, sort_order)
values ('Tathiana', 'tathiana', 1)
on conflict (slug) do nothing;

insert into public.services (
  slug,
  name,
  category,
  description,
  duration_minutes,
  buffer_before_minutes,
  buffer_after_minutes,
  price_cop,
  price_verified,
  duration_verified,
  active,
  sort_order
)
values
  (
    'pestanas-pelo-a-pelo-volumen',
    'Pestañas Pelo a Pelo & Volumen',
    'Extensiones de Autor',
    'Fibras ultrafinas aplicadas con mapeo anatómico según la densidad de tu pestaña natural.',
    60,
    0,
    15,
    120000,
    false,
    false,
    true,
    1
  ),
  (
    'diseno-laminado-cejas',
    'Diseño y Laminado de Cejas',
    'Arquitectura Facial',
    'Moldeado orgánico, fijación de keratina y visagismo milimétrico con depilación de alta definición.',
    40,
    0,
    15,
    65000,
    false,
    false,
    true,
    2
  ),
  (
    'lash-lifting-tinte',
    'Lash Lifting & Tinte Profesional',
    'Efecto Óptico Natural',
    'Curvatura desde la raíz que abre tu mirada sin extensiones, con nutrición de keratina intensa.',
    50,
    0,
    15,
    85000,
    false,
    false,
    true,
    3
  ),
  (
    'facial-glow-therapy',
    'Cuidado Facial & Glow Therapy',
    'Hidratación Celular',
    'Limpieza profunda, exfoliación no abrasiva y sueros iluminadores para un lienzo dérmico radiante.',
    60,
    0,
    15,
    110000,
    false,
    false,
    true,
    4
  )
on conflict (slug) do nothing;

insert into public.business_hours (
  professional_id,
  weekday,
  opens_at,
  closes_at
)
select
  p.id,
  d.weekday,
  time '09:00',
  time '19:00'
from public.professionals p
cross join generate_series(1, 6) as d(weekday)
where p.slug = 'tathiana'
on conflict (professional_id, weekday, opens_at, closes_at) do nothing;

insert into public.settings (id)
values (true)
on conflict (id) do nothing;
