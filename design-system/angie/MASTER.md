# Angie Pichardo — Design Master

Source of truth for every page. Built from the ui-ux-pro-max rules (accessibility,
touch, hierarchy, performance) and the brand constraint: **keep Angie's palette**,
take the *flow* of speaker-brand sites (big photo-led hero, proof, statement,
offers, process, form, footer) and remove everything that reads as AI-generated.

## Who this is for
Christian motivational speaker / life coach. Visitors: event organizers booking a
keynote, women looking for coaching, women booking mobile wellness. Tone:
warm, personal, confident. Never corporate, never "SaaS".

## Palette (unchanged tokens in `src/styles/global.css`)
| Token | Hex | Use |
|---|---|---|
| `angie-noir` | #1F0612 | Text on light, dark planes |
| `angie-wine` | #4A0D28 | Secondary dark plane |
| `angie-burgundy` | #8A2654 | Accent on light, one dark plane per page max |
| `angie-rose` | #C4658A | Accent on dark only (contrast 4.5:1 on noir/wine) |
| `angie-cream` | #FFF5FA | Light plane, text on dark |

Rules: solid colour planes, no decorative gradients except the signature fixed
body gradient (already in `MainLayout`). Text contrast ≥ 4.5:1 (rose on cream: forbidden).

## What makes a page look AI-generated (BANNED)
1. Small uppercase letter-spaced eyebrow above every heading (`tracking-[0.3em]`).
   Allowed at most once per page and only if it carries real information (a date, a place).
2. Emoji or unicode glyphs as icons (`💜`, `✓` in a circle, `→` as decoration). Use inline SVG
   (Lucide style, 1.75 stroke) or nothing.
3. Giant decorative ghost numerals/letters behind cards, `01 / 02 / 03` badges, `Q.01` FAQ numbering.
4. Glass cards: `bg-white/5 + border-white/10 + backdrop-blur`. Blurred glow blobs in corners.
5. Three equal rounded cards in a row as the answer to every section.
6. One word of the H1 in the accent colour, in every hero.
7. The same section padding (`py-20 md:py-28`) and the same `timeline-view animate-rise` on everything.
8. Pill badges and chips as decoration, `rounded-3xl` everywhere, identical `hover:-translate-y` on all cards.
9. Copy tics: "not X, not Y, not Z" triplets, "No X. No Y.", "Two minutes.", em-dash drama, rhetorical
   statement blocks. Keep Angie's own factual copy; do not invent claims; trim filler.

## What to do instead
- **Photography leads.** Real photos of Angie carry hero, offers and about. Use them large, with
  `object-position` chosen for the face, `width/height` set, `loading` correct.
- **Asymmetry and scale.** Mix a 7/5 split, a full-bleed image band, a narrow text column, a
  two-column list with hairlines. Vary vertical rhythm per section (`py-14` … `py-32`).
- **Hairlines, not boxes.** Group with `border-t border-current/15`, big type and whitespace.
  If a card is needed it is flat: solid plane, `rounded-lg`, photo or text, no border + shadow stack.
- **Type with hierarchy.** Display: Fraunces (`font-Frauce`) at 600–700, tight leading, sizes
  `clamp()`; body: Space Grotesk 17–18px/1.6, max 62ch. Two weights only per block.
- **One button system** (classes in `global.css`): `btn btn-light | btn-dark | btn-outline-light |
  btn-outline-dark`, plus `link-arrow` for tertiary. Rectangular (`rounded-md`), 48px min height,
  visible focus ring. One primary CTA per section.
- **Motion with intent.** Hero: single staggered rise on load. Sections: fade/rise once. Keep the
  site's `tada` and `scale` flavour only on the primary hero CTA (hover). Respect reduced motion.
- **Forms/modals** use palette colours (no teal), visible labels, errors next to the field.

## Section recipes (pick, don't repeat)
Hero (photo + H1 + one CTA) · Proof strip (real facts or testimonials, not made-up numbers) ·
Statement (one sentence, real, optional) · Offer list (photo-led rows, alternate sides) ·
Process (3–4 steps, hairline-separated, text only) · Testimonials (quote large, one at a time or 2-up) ·
About (photo + story) · FAQ (`details`, hairline rows, no numbering) · Final CTA (solid plane).

## Hard constraints (do not break)
- Keep IDs/data attributes used by scripts: `#open-modal`, `#open-modal-2`, `#open-modal-3`, `#download-modal`,
  `#download-form`, `#panel-form`, `#panel-success`, `#submit-btn`, `#btn-label`, `#btn-arrow`, `#form-status`,
  `[data-phone-toggle]`, `[data-phone-label]`, `[data-phone-sr]`, `[data-phone-icon-default]`,
  `[data-phone-icon-revealed]`, `#service-map` (+ Leaflet link/script), JSON-LD scripts.
- Keep all `href`s (TidyCal links, tel:, socials), page `<title>`/description/canonical props, and `<h1>` count of 1.
- No new dependencies. No external fonts/CDNs (self-hosted fonts only).
- Mobile first: verify 360, 390, 768, 1280. No horizontal scroll. Touch targets ≥ 44px.
- Images: only files already in `public/images/**`.
