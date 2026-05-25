Build a luxury retail clienteling app called "Maison Vaurien · Clienteling". This is an internal tool used by store staff at a high-end fashion boutique to manage customer relationships and get AI-powered product recommendations.

---

## WHAT THE APP LOOKS LIKE

Dark, editorial luxury feel. Think high-end fashion magazine — large italic serif headings, small uppercase monospace labels, generous white space. Cards have subtle borders and hover shadows. Buttons are minimal and uppercase. The overall tone is quiet, premium, and professional.

---

## WHO USES IT

There are three types of users. The role can be switched from the sidebar for demo purposes.

**Store Associate (Julian Soames)**
- Works at the Bond Street Flagship store
- Can only see customers and data from their own store
- Manages today's in-store appointments
- Can view and use AI recommendations

**Marketing (Camille Devereux)**
- Can see all stores and all customers across the network
- Can create and edit customer personas
- Can view the analytics dashboard
- Cannot see Today's roster

**Admin (Hélène Marchand)**
- Full access to everything
- Cannot see Today's roster either — that's store-specific

---

## SIDEBAR NAVIGATION

Left sidebar with the brand name at the top and the user's name/role at the bottom. The bottom shows a role switcher — clicking it reveals a small dropdown to switch between the three roles (for demo purposes).

Navigation items shown depend on the user's role. Associates see: Today, Customers, Recommendations, Personas, Products. Marketing and Admin see: Customers, Recommendations, Personas, Products, Analytics. Today is hidden from Marketing and Admin.

---

## PAGES

### Today (Store Associates only)
When Marketing or Admin visits this page, redirect them straight to Analytics.

For Associates: Shows today's date and store name. A row of stat cards shows how many guests are expected, how many are currently in the store, how many have completed shopping, and how many AI briefs are prepared.

Below that is "Today's Roster" — a list of today's expected customers with their photo, name, persona, appointment time, and lifetime spend.

Each customer has a status badge the associate can click to update manually:
- **Expected** — grey, not yet arrived
- **In Store** — gold with a pulsing dot, currently in the boutique
- **Completed** — green, finished shopping and left

Clicking the badge cycles through these three states. The associate updates this themselves — it is not automatic. The status is remembered even after page refresh.

Clicking a customer's name opens their full profile.

---

### Customers
A searchable directory of all customers.

At the top is a search bar. Typing filters customers by name, persona, or tier. If the search finds no one, show a message: *"This customer is not in our database. The AI recommendation engine only works with existing customers."*

For **Associates**: shows only their store's customers. No store filter shown.

For **Marketing/Admin**: shows customers from all stores. Shows a row of filter tabs at the top — All, Bond St. Flagship, Mayfair, Paris Faubourg, New York Fifth Ave — with customer counts. The customer's store is shown on their card.

Each customer card shows their photo, name in italic, persona in small caps, tier, and lifetime spend.

There is no "Add New Customer" button on this page.

---

### Customer 360 (detail page)
Clicking any customer opens their full profile.

**Left panel:** large portrait photo, name, persona, tier. Two buttons — Edit and Delete — visible to everyone regardless of role. Below that: stats (lifetime value, last visit, garment size, shoe size), style preferences as pill tags, recent purchases with images, and a short persona description.

**Main area:**
- "Claude's Recommendations" section — shows AI-curated product cards for this customer. Each card has the product photo, name, price, reasoning for the recommendation, signal tags (like "High Affinity" or "Persona Match 98%"), stock count, and an icebreaker conversation opener in a quote box.
- "Post-Visit Follow-up" section — a pre-written follow-up message in the brand's voice that the associate can edit and send via the concierge system.

Edit opens a form to update the customer's details. Delete asks for confirmation, then removes the customer and all their recommendations.

---

### Recommendations
A table of all AI recommendations across all customers.

Each row shows the customer name, product name and SKU, an affinity score with a small progress bar, signal tags, and the icebreaker text.

Anyone can view. Hovering a row reveals Edit and Delete icon buttons. There's an Add button to create a new recommendation.

The form asks for: customer (dropdown), product (dropdown), affinity score (0–100), reasoning, icebreaker, and signals.

All fields show inline error messages if left blank. Toast notifications appear on success or failure.

---

### Personas
Cards showing each customer persona — name, description, how many customers belong to it, personality weights shown as horizontal bars (e.g. "Heritage & Craft: 92%"), and a list of guardrails (rules Claude follows when writing for this persona).

Associates can read but not edit (a lock icon appears in the sidebar). Marketing and Admin can create, edit, and delete personas.

---

### Products
A grid of product cards — photo, name, SKU, category, price, floor stock and vault stock numbers.

Marketing and Admin can add, edit, and delete products.

---

### Analytics (Marketing and Admin only)
**Overall performance** for the last 30 days across all stores — four headline numbers: attach rate uplift, assisted conversion rate, average basket size, persona match precision.

A row of summary figures: total revenue across all stores, total sessions, number of active stores, and live customer count.

**Store Performance table** — one row per store showing: store name and customer count, revenue, conversion rate with a small bar, average basket, sessions, attach rate uplift, and top-performing persona.

Stores and their data:
- Bond St. Flagship — £226,540 revenue, 62% conversion, £4,820 avg basket, 47 sessions, +18% attach rate
- Mayfair — £122,450 revenue, 58% conversion, £3,950 avg basket, 31 sessions, +12% attach rate
- Paris Faubourg — £390,600 revenue, 71% conversion, £6,200 avg basket, 63 sessions, +24% attach rate
- New York Fifth Ave — £193,800 revenue, 65% conversion, £5,100 avg basket, 38 sessions, +15% attach rate

**Persona Performance** — each persona with their conversion rate bar and average basket value.

---

## ARRIVAL ALERT

When a customer has "arrived" status, a notification card slides in from the top-right corner of the screen about 1 second after the page loads. It shows the customer's photo, name, persona, and tier with an "Arrival Detected" label. There is an X button to dismiss it. Once dismissed, it never appears again for that customer — remembered across page refreshes.

---

## CUSTOMERS IN THE DATABASE

Seed the app with these customers on first load:

**Bond St. Flagship**
- Aria Sterling — VIC Tier I, Quiet Luxury Connoisseur, lifetime £142,500, status: arrived, appointment 14:30, garment IT 40, shoe EU 38, preferences: Virgin Wool / Oversized Fit / Beige-Taupe Palette / No Logos
- Julian Ashford — VIC Tier II, Heritage Bespoke, lifetime £89,200, status: expected, appointment 15:15, garment UK 42R, shoe UK 9.5, preferences: Made-to-Measure / Charcoal-Navy / Brogue Detailing
- Isabelle Moreau — Private Client, Editorial Modernist, lifetime £54,800, status: expected, appointment 16:00, garment FR 36, shoe EU 37, preferences: Architectural Silhouettes / Monochrome / Statement Outerwear

**Mayfair**
- Sophia Laurent — VIC Tier I, Quiet Luxury Connoisseur, lifetime £118,200
- Henry Beaumont — VIC Tier II, Heritage Bespoke, lifetime £73,400

**Paris Faubourg**
- Céleste Dubois — VIC Tier I, Editorial Modernist, lifetime £196,800
- Pierre Moreau — Private Client, Heritage Bespoke, lifetime £62,100

**New York Fifth Ave**
- Victoria Hayes — VIC Tier I, Quiet Luxury Connoisseur, lifetime £231,400
- James Whitfield — VIC Tier II, Heritage Bespoke, lifetime £104,700

---

## PRODUCTS IN THE DATABASE

- Structured Cashmere Overcoat — Outerwear, £3,450, SKU 9912-VIC, 1 on floor + 1 in vault
- Saddle Grain Calfskin Tote — Leather Goods, £2,800, SKU 4021-CHE, 2 on floor
- Hand-Rolled Silk Scarf, Noir — Accessories, £420, SKU 7733-NOR, 4 on floor + 2 in vault
- Grained Calfskin Loafer — Footwear, £1,100, SKU 2208-CHO, 1 on floor + 3 in vault

---

## PERSONAS IN THE DATABASE

**Quiet Luxury Connoisseur** — Values tactile materiality over logos. Prefers private fitting suites and pre-orders off-runway pieces. 47 clients. Guardrails: avoid words like "trendy" or "viral", focus on heritage and craftsmanship.

**Heritage Bespoke** — Loyal to tailoring traditions. Books made-to-measure twice yearly. Prefers in-person consultations. 23 clients. Guardrails: reference archive provenance, never suggest ready-to-wear when bespoke is available.

**Editorial Modernist** — Follows runway. Buys statement pieces with sharp silhouettes. 31 clients. Guardrails: surface runway-exclusive and limited-edition pieces first.

---

## RECOMMENDATIONS IN THE DATABASE

For Aria Sterling: Cashmere Overcoat (affinity 96%), Calfskin Tote (87%), Silk Scarf (74%) — each with reasoning and a personal icebreaker line.

For Julian Ashford: Calfskin Loafer (affinity 92%) — referencing his pattern of buying this style.

For Isabelle Moreau: Cashmere Overcoat (affinity 88%) — referencing her editorial preferences.

---

## GENERAL BEHAVIOURS

- All data is stored in the browser. Nothing is saved to a server. Refreshing the page keeps the data.
- The seed data loads automatically the very first time someone opens the app. It never overwrites data the user has added.
- Every form shows red inline error messages if required fields are empty — errors only appear after the user tries to submit, not while typing.
- Every save action shows a success or failure notification in the bottom-right corner.
- The app works as a standard website — typing the URL of any page directly in the browser should work correctly.
