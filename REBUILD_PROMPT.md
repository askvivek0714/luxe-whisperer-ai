Build a retail clienteling web app called "ABL Clienteling" for Absolute Labs (absolutelabs.co).
It is a single-page app that runs entirely in the browser — all data stored in localStorage, no backend.
The design should be clean, modern, and professional: blue primary color, Inter font, white cards,
light grey background. Show an "ABL" logo badge and "by Absolute Labs" in the sidebar header.
Add a small absolutelabs.co footer link at the bottom of the sidebar.

---

## THREE ROLES

Switchable from the sidebar bottom for demo purposes.

- **Associate** (Julian Soames, Bond St.) — sees Today, Customers, AI Briefings, Personas, Products
- **Marketing** (Camille Devereux) — sees Customers, AI Briefings, Personas, Products, Analytics
- **Admin** (Hélène Marchand) — same as Marketing

Associates only see their own store (Bond St. Flagship). Marketing/Admin see all 4 stores:
Bond St. Flagship, Mayfair, Paris Faubourg, New York Fifth Ave.

---

## PAGES

### Today (Associates only — redirect others to Analytics)
- Greeting with today's date and store name
- 4 stat cards: Expected, In Store, Completed, AI Briefs Prepared
- Roster table of today's customers: avatar, name, persona, appointment time, lifetime spend, status badge
- Status badge cycles on click: Expected → In Store → Completed (persisted in localStorage key `today:roster-status`)
- Clicking a row navigates to that customer's full profile

### Customers
- Search bar filtering by name, persona, or tier
- Marketing/Admin: store filter tabs (All + 4 stores) with counts
- Grid of customer cards: avatar (initials-based colored circle, no photos), name, persona, tier, lifetime value
- "Add Customer" button opens a form with fields: name (required), tier, status, store, lifetime value,
  appointment time, persona (dropdown from personas list), garment size, shoe size, preferences (comma-separated)
- Required field validation with inline errors shown only after submit attempt; toast on success/error

### Customer 360 (clicking any customer)
**Left sidebar:**
- Large avatar (initials circle), name, persona, tier
- Visit status badge — same 3-state cycle (Expected / In Store / Completed), synced with Today roster
  via the same localStorage key. Clicking advances the status.
- Stats grid: lifetime value, last visit days, garment size, shoe size
- Style preferences as pill tags
- Recent purchases with product images
- Persona description with a link to the Personas page
- No Edit or Delete buttons

**Main area:**
- "Claude's Recommendations" section — AI-curated product cards for this customer.
  Each card: product image, name, SKU, price, affinity %, reasoning text, signal tags, icebreaker quote box.
- When visit status is **Completed**: show a "Visit Notes" section with:
  - Voice recorder using browser MediaRecorder API (in-memory blob, playable but not persisted across sessions)
  - Text notes textarea (auto-saved to localStorage key `visit-notes:{clientId}`)
- Post-visit follow-up: pre-written message editable by the associate, mock send via concierge (toast confirmation)

### AI Briefings
- All recommendations grouped by customer
- Each customer section: avatar, name, persona, tier, link to Customer 360
- Product cards under each customer: image, name, SKU, price, affinity %, reasoning, signal tags
- No "New" button — view only. Hover a card to reveal a delete (trash) icon.

### Personas
- Cards per persona: name, description, client count, personality trait bars (e.g. Heritage & Craft 92%),
  guardrail rules list
- Marketing/Admin can create, edit, delete personas
- Associates see a lock icon in sidebar nav (read-only view)

### Products
- List rows: product image, name, SKU, category, price, floor stock, vault stock
- Clicking any row opens a detail modal: full image, stock levels, persona affinity bars
  (computed from recommendations), list of customers this product was recommended to
- Marketing/Admin can add, edit, delete products

### Analytics (Marketing/Admin only)
- 4 headline metrics: attach rate uplift, assisted conversion rate, avg basket size, persona match precision
- Summary row: total revenue, sessions, active stores, live customer count (from localStorage)
- Store performance table — one row per store: store name, customer count, revenue, conversion bar,
  avg basket, sessions, attach rate, top persona
- Persona performance: conversion rate bar and avg basket per persona

Store data:
- Bond St. Flagship — £226,540, 62% conversion, £4,820 avg basket, 47 sessions, +18% attach
- Mayfair — £122,450, 58% conversion, £3,950 avg basket, 31 sessions, +12% attach
- Paris Faubourg — £390,600, 71% conversion, £6,200 avg basket, 63 sessions, +24% attach
- New York Fifth Ave — £193,800, 65% conversion, £5,100 avg basket, 38 sessions, +15% attach

---

## ARRIVAL ALERT

When any customer has status "arrived", slide in a notification from the top-right corner 1 second
after page load. Shows avatar, name, persona, tier, "Arrival Detected" label, and an X dismiss button.
Once dismissed, never shows again for that customer (localStorage). Shows only once per browser session
(sessionStorage) — does not re-fire on every page navigation.

---

## SIDEBAR DETAILS

- Associates see a "Bond St. Team" expandable section showing online colleagues:
  Sophie Bellamy (Associate), Marcus Webb (Associate), Priya Nair (Senior Associate) — all with green dots
- Header shows role badge and store/time for associates only
- Role switcher dropdown at bottom — current role highlighted

---

## SEED DATA (load once on first visit, never overwrite)

### Customers

**Bond St. Flagship:**
- Aria Sterling — VIC Tier I, Quiet Luxury Connoisseur, £142,500, status: arrived, appt 14:30,
  garment IT 40, shoe EU 38, prefs: Virgin Wool / Oversized Fit / Beige-Taupe Palette / No Logos
- Julian Ashford — VIC Tier II, Heritage Bespoke, £89,200, status: expected, appt 15:15,
  garment UK 42R, shoe UK 9.5, prefs: Made-to-Measure / Charcoal-Navy / Brogue Detailing
- Isabelle Moreau — Private Client, Editorial Modernist, £54,800, status: expected, appt 16:00,
  garment FR 36, shoe EU 37, prefs: Architectural Silhouettes / Monochrome / Statement Outerwear
- Margaux Fontaine — VIC Tier I, Quiet Luxury Connoisseur, £98,300
- Sebastian Cole — Private Client, Heritage Bespoke, £41,200
- Yuki Tanaka — VIC Tier II, Editorial Modernist, £67,800

**Mayfair:**
- Sophia Laurent — VIC Tier I, Quiet Luxury Connoisseur, £118,200
- Henry Beaumont — VIC Tier II, Heritage Bespoke, £73,400

**Paris Faubourg:**
- Céleste Dubois — VIC Tier I, Editorial Modernist, £196,800
- Pierre Moreau — Private Client, Heritage Bespoke, £62,100

**New York Fifth Ave:**
- Victoria Hayes — VIC Tier I, Quiet Luxury Connoisseur, £231,400
- James Whitfield — VIC Tier II, Heritage Bespoke, £104,700

### Products
- Structured Cashmere Overcoat — Outerwear, £3,450, SKU P-9912, floor 1, vault 1
- Saddle Grain Calfskin Tote — Leather Goods, £2,800, SKU P-4021, floor 2, vault 0
- Hand-Rolled Silk Scarf Noir — Accessories, £420, SKU P-7733, floor 4, vault 2
- Grained Calfskin Loafer — Footwear, £1,100, SKU P-2208, floor 1, vault 3
- Fine Merino Roll-Neck — Knitwear, £890, SKU P-3341, floor 3, vault 1
- Tailored Wool Trousers — Tailoring, £1,240, SKU P-5502, floor 2, vault 2
- Petit Grain Leather Belt — Accessories, £320, SKU P-1108, floor 5, vault 0
- Silk Evening Chemise — Ready-to-Wear, £1,680, SKU P-6671, floor 1, vault 2

### Personas
- **Quiet Luxury Connoisseur** — Values tactile materiality over logos. Prefers private fittings.
  Weights: Understated Elegance 95%, Material Purity 88%, Heritage 72%.
  Guardrails: avoid "trendy" or "viral", focus on craftsmanship.
- **Heritage Bespoke** — Loyal to tailoring traditions. Books made-to-measure twice yearly.
  Weights: Tailoring Heritage 92%, Formality 85%, Provenance 78%.
  Guardrails: reference archive provenance, never suggest RTW when bespoke is available.
- **Editorial Modernist** — Follows runway. Buys statement pieces with sharp silhouettes.
  Weights: Avant-Garde 90%, Runway Access 82%, Monochrome 75%.
  Guardrails: surface runway-exclusive and limited-edition pieces first.

### Recommendations
- Aria Sterling: Cashmere Overcoat (96%), Calfskin Tote (87%), Silk Scarf (74%) — each with reasoning and icebreaker
- Julian Ashford: Calfskin Loafer (92%) — referencing his pattern of seasonal footwear investment
- Isabelle Moreau: Cashmere Overcoat (88%) — referencing her editorial outerwear preference

---

## GENERAL BEHAVIOURS

- All customer avatars are initials-based colored circles — consistent color per name, no photo uploads
- All forms: inline required-field errors shown only after first submit attempt, not while typing
- Every save/delete shows a success or error toast notification
- Direct URL navigation must work for all pages (SPA: redirect /* → index.html)
- Seed data loads automatically on first visit and never overwrites user-added data
- Visit status changes on Today page and Customer 360 are synced (same localStorage key)
- Visit notes (text) on completed visits are saved automatically per customer
