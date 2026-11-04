-- Alinea el año del hero con el año vigente. El contenido editorial se
-- edita desde el panel; esta migración solo corrige el valor sembrado.
update public.site_content
set content = jsonb_set(content, '{hero,year}', to_jsonb('2026'::text), true)
where content #>> '{hero,year}' = '2025';
