-- ARCH member corrections — run in the Supabase SQL editor (bypasses RLS).
--
-- Background: `doctor-database.ts` used to alias "Chafika Haouichet" onto
-- "Chafia Dahou Makhloufi" as if they were one person. They are two different
-- Algerian rheumatologists — Haouichet is a full ARCH member, Dahou-Makhloufi
-- appears only in the ARCH network. That alias has been split in the code, but
-- while it was live an admin save wrote the merged result into `admin_doctors`,
-- so Dahou-Makhloufi's stored row still carries Haouichet's biography and has
-- lost its ARCH placements. Those stored values win over the source database by
-- design, so they can only be corrected here.
--
-- Safe to re-run: every statement is an idempotent overwrite of specific keys.

begin;

-- 1. Chafia Dahou-Makhloufi — restore her own biography.
--    Currently holds Haouichet's ("Saad Dahlab… Djillali Bounaama… General
--    Secretary of the Algerian Society"), which is what /about/scientific-committee
--    has been displaying on her card.
update public.admin_doctors
set data = jsonb_set(
  data,
  '{biography}',
  '["Professor of Rheumatology",
    "Member of the ArLAR Scientific Committee representing Algeria"]'::jsonb,
  true
)
where id = 'chafia-dahou-makhloufi';

-- 2. Chafia Dahou-Makhloufi — restore her ARCH Network placement.
--    She is in the network grid on arabrheumatology.org/arch but not a full
--    member, so only the network placement is added back. Without it she is
--    absent from the ARCH page entirely.
update public.admin_doctors
set data = jsonb_set(
  data,
  '{appearances}',
  (data -> 'appearances') || '[{
    "id": "sig-research:arch-network",
    "path": "/special-interest-groups/research",
    "role": "",
    "pageId": "sig-research",
    "section": "ARCH Network",
    "pageTitle": "ArLAR Research Group"
  }]'::jsonb,
  true
)
where id = 'chafia-dahou-makhloufi'
  and not (data -> 'appearances') @> '[{"id": "sig-research:arch-network"}]'::jsonb;

-- 3. Suad Abd Ellateif Eltaybe Mohammed — restore her full name, credentials
--    and portrait. The row was written with a shortened name, an empty
--    credentials string and the placeholder image. The code now refuses to let
--    blank stored values erase the source database, so the photo and "MD"
--    already display; this makes the stored record itself correct, so the admin
--    editor shows the right values too.
update public.admin_doctors
set
  name = 'Suad Abd Ellateif Eltaybe Mohammed, MD',
  data = data
    || jsonb_build_object(
      'name', 'Suad Abd Ellateif Eltaybe Mohammed',
      'fullName', 'Suad Abd Ellateif Eltaybe Mohammed, MD',
      'credentials', 'MD',
      'image', '/images/sig-members/1f2182_665662bc99634133b459fb88df7004ee~mv2.jpg'
    )
where id = 'suad-mohammed';

commit;

-- Verify:
-- select id, name,
--        data ->> 'credentials'  as credentials,
--        data ->> 'image'        as image,
--        data -> 'biography'     as biography,
--        jsonb_path_query_array(data -> 'appearances', '$[*].id') as placements
-- from public.admin_doctors
-- where id in ('chafia-dahou-makhloufi', 'suad-mohammed');
