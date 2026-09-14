# ArLAR Website Rebuild - Claude Handoff

## Purpose

Rebuild `arabrheumatology.org` from a Wix site into a full-stack Next.js application. This repo should stay implementation-ready but visually undecided: Claude owns design and UI direction.

## What ArLAR Is

ArLAR is the Arab League of Associations for Rheumatology, a regional professional association representing rheumatologists and national rheumatology societies across Arab countries. The organization focuses on rheumatology care, education, research, professional collaboration, congresses, public awareness, and patient-facing material.

Core positioning from the current website:

- Founded on March 29, 1995 as the Pan Arab Society of Rheumatic Diseases.
- Renamed/rebranded to the Arab League of Associations for Rheumatology in 2018.
- Represents Arab rheumatologists and member societies.
- Promotes excellence in rheumatic and musculoskeletal disease care.
- Advances education, research, professional development, and regional/global collaboration.
- Supports patient health through awareness, training, research, and public resources.

## Build Stack

- Next.js App Router, TypeScript, Tailwind v4.
- Backend through Next route handlers and server actions where appropriate.
- Supabase for relational data, auth/admin access, newsletter subscriptions, forms, and editorial workflows.
- Cloudflare R2 for uploaded files, images, PDFs, congress material, bylaws, abstracts, and replay assets.

## Current Repo State

- Fresh Next.js scaffold.
- No design system chosen yet.
- Docs prepared as migration context.
- Starter homepage is intentionally sparse and only points to docs.

## Recommended First Product Slice

1. Define data models and routes.
2. Build content admin schema before visual polish.
3. Migrate high-value pages first: Home, About, Board, Members, News, ArLAR College Events, ArLAR25 archive.
4. Add asset migration pipeline to Cloudflare R2.
5. Add multilingual planning for English, Arabic, and French before routes harden.

## Source Notes

Current source site reviewed July 2, 2026:

- https://www.arabrheumatology.org/
- https://www.arabrheumatology.org/about-arlar
- https://www.arabrheumatology.org/about-us
- https://www.arabrheumatology.org/national-societies
- https://www.arabrheumatology.org/arlar25-congress
- https://www.arabrheumatology.org/arlar-college-events
- https://www.arabrheumatology.org/specialist-interests-groups
- https://www.arabrheumatology.org/blog

