import type { PersonaRow } from "./fns/personas";
import type { ClientRow } from "./fns/clients";
import type { ProductRow } from "./fns/products";
import type { RecommendationRow } from "./fns/recommendations";

const KEYS = {
  personas: "luxe:personas",
  clients: "luxe:clients",
  products: "luxe:products",
  recommendations: "luxe:recommendations",
  seeded: "luxe:seeded:v3",
};

// ── Generic helpers ───────────────────────────────────────────────────────────

export function getAll<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

export function saveAll<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ── Typed accessors ───────────────────────────────────────────────────────────

export const store = {
  personas: {
    list: () => getAll<PersonaRow>(KEYS.personas),
    save: (items: PersonaRow[]) => saveAll(KEYS.personas, items),
    get: (id: string) => getAll<PersonaRow>(KEYS.personas).find((p) => p.id === id) ?? null,
  },
  clients: {
    list: () => getAll<ClientRow>(KEYS.clients),
    save: (items: ClientRow[]) => saveAll(KEYS.clients, items),
    get: (id: string) => getAll<ClientRow>(KEYS.clients).find((c) => c.id === id) ?? null,
  },
  products: {
    list: () => getAll<ProductRow>(KEYS.products),
    save: (items: ProductRow[]) => saveAll(KEYS.products, items),
    get: (id: string) => getAll<ProductRow>(KEYS.products).find((p) => p.id === id) ?? null,
  },
  recommendations: {
    list: () => getAll<RecommendationRow>(KEYS.recommendations),
    save: (items: RecommendationRow[]) => saveAll(KEYS.recommendations, items),
    get: (id: number) =>
      getAll<RecommendationRow>(KEYS.recommendations).find((r) => r.id === id) ?? null,
  },
};

// ── Seed data (v3) ────────────────────────────────────────────────────────────

export function ensureSeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;

  const personas: PersonaRow[] = [
    {
      id: "quiet-luxury",
      name: "Quiet Luxury Connoisseur",
      description:
        "Values tactile materiality over logos. Prefers private fitting suites and pre-orders off-runway pieces.",
      client_count: 47,
      weights: [
        { label: "Visual Minimalism", value: 85 },
        { label: "Brand Salience", value: 12 },
        { label: "Heritage & Craft", value: 92 },
        { label: "Newness Appetite", value: 38 },
      ],
      guardrails: [
        "Avoid adjectives like 'trendy', 'viral', or 'must-have'.",
        "Focus on heritage, craftsmanship, and longevity.",
        "Suggest complimentary gift wrapping only on items >£5k.",
      ],
    },
    {
      id: "heritage",
      name: "Heritage Bespoke",
      description:
        "Loyal to tailoring traditions. Books made-to-measure twice yearly. Prefers in-person consultations.",
      client_count: 23,
      weights: [
        { label: "Visual Minimalism", value: 60 },
        { label: "Brand Salience", value: 25 },
        { label: "Heritage & Craft", value: 98 },
        { label: "Newness Appetite", value: 20 },
      ],
      guardrails: [
        "Reference archive and atelier provenance.",
        "Never recommend ready-to-wear when bespoke is available.",
      ],
    },
    {
      id: "editorial",
      name: "Editorial Modernist",
      description:
        "Follows runway. Buys statement pieces with sharp silhouettes. Often photographed at industry events.",
      client_count: 31,
      weights: [
        { label: "Visual Minimalism", value: 55 },
        { label: "Brand Salience", value: 70 },
        { label: "Heritage & Craft", value: 65 },
        { label: "Newness Appetite", value: 88 },
      ],
      guardrails: [
        "Surface runway-exclusive and limited-edition pieces first.",
        "Reference editorial placements where relevant.",
      ],
    },
  ];

  const products: ProductRow[] = [
    {
      id: "P-9912",
      sku: "9912-VIC",
      name: "Structured Cashmere Overcoat",
      category: "Outerwear",
      price: "£3,450",
      image: "product-overcoat",
      floor_stock: 1,
      vault_stock: 1,
    },
    {
      id: "P-4021",
      sku: "4021-CHE",
      name: "Saddle Grain Calfskin Tote",
      category: "Leather Goods",
      price: "£2,800",
      image: "product-tote",
      floor_stock: 2,
      vault_stock: 0,
    },
    {
      id: "P-7733",
      sku: "7733-NOR",
      name: "Hand-Rolled Silk Scarf, Noir",
      category: "Accessories",
      price: "£420",
      image: "product-scarf",
      floor_stock: 4,
      vault_stock: 2,
    },
    {
      id: "P-2208",
      sku: "2208-CHO",
      name: "Grained Calfskin Loafer",
      category: "Footwear",
      price: "£1,100",
      image: "product-loafer",
      floor_stock: 1,
      vault_stock: 3,
    },
    {
      id: "P-3341",
      sku: "3341-MRN",
      name: "Fine Merino Roll-Neck",
      category: "Knitwear",
      price: "£680",
      image: "product-scarf",
      floor_stock: 3,
      vault_stock: 2,
    },
    {
      id: "P-5502",
      sku: "5502-TWL",
      name: "Tailored Wool Trousers",
      category: "Tailoring",
      price: "£1,250",
      image: "product-overcoat",
      floor_stock: 2,
      vault_stock: 1,
    },
    {
      id: "P-1108",
      sku: "1108-BLT",
      name: "Petit Grain Leather Belt",
      category: "Accessories",
      price: "£320",
      image: "product-loafer",
      floor_stock: 6,
      vault_stock: 4,
    },
    {
      id: "P-6671",
      sku: "6671-SLK",
      name: "Silk Evening Chemise",
      category: "Evening Wear",
      price: "£1,800",
      image: "product-tote",
      floor_stock: 1,
      vault_stock: 2,
    },
  ];

  const clients: ClientRow[] = [
    // ── Bond St. Flagship ─────────────────────────────────────────────────────
    {
      id: "aria-sterling",
      name: "Aria Sterling",
      portrait: "client-aria",
      persona: "Quiet Luxury Connoisseur",
      persona_id: "quiet-luxury",
      store: "Bond St. Flagship",
      tier: "VIC · Tier I",
      lifetime_value: "£142,500",
      last_visit_days: 14,
      appointment_time: "14:30",
      status: "arrived",
      garment_size: "IT 40",
      shoe_size: "EU 38",
      preferences: ["Virgin Wool", "Oversized Fit", "Beige / Taupe Palette", "No Logos"],
      acquisitions: [
        { name: "Nappa Calfskin Tote", season: "AW24", price: "£3,450", image: "product-tote" },
        { name: "Silk Maxi Dress", season: "SS24", price: "£2,200", image: "product-scarf" },
      ],
    },
    {
      id: "julian-ashford",
      name: "Julian Ashford",
      portrait: "client-julian",
      persona: "Heritage Bespoke",
      persona_id: "heritage",
      store: "Bond St. Flagship",
      tier: "VIC · Tier II",
      lifetime_value: "£89,200",
      last_visit_days: 27,
      appointment_time: "15:15",
      status: "expected",
      garment_size: "UK 42R",
      shoe_size: "UK 9.5",
      preferences: ["Made-to-Measure", "Charcoal / Navy", "Brogue Detailing"],
      acquisitions: [
        { name: "Grained Calfskin Loafer", season: "AW24", price: "£1,100", image: "product-loafer" },
      ],
    },
    {
      id: "isabelle-moreau",
      name: "Isabelle Moreau",
      portrait: "client-isabelle",
      persona: "Editorial Modernist",
      persona_id: "editorial",
      store: "Bond St. Flagship",
      tier: "Private Client",
      lifetime_value: "£54,800",
      last_visit_days: 6,
      appointment_time: "16:00",
      status: "expected",
      garment_size: "FR 36",
      shoe_size: "EU 37",
      preferences: ["Architectural Silhouettes", "Monochrome", "Statement Outerwear"],
      acquisitions: [
        { name: "Hand-Rolled Silk Scarf", season: "AW24", price: "£420", image: "product-scarf" },
      ],
    },
    {
      id: "margaux-fontaine",
      name: "Margaux Fontaine",
      portrait: "client-aria",
      persona: "Quiet Luxury Connoisseur",
      persona_id: "quiet-luxury",
      store: "Bond St. Flagship",
      tier: "Private Client",
      lifetime_value: "£38,400",
      last_visit_days: 3,
      appointment_time: "13:00",
      status: "expected",
      garment_size: "FR 38",
      shoe_size: "EU 39",
      preferences: ["Cashmere", "Ivory Palette", "Timeless Cuts"],
      acquisitions: [
        { name: "Fine Merino Roll-Neck", season: "AW24", price: "£680", image: "product-scarf" },
      ],
    },
    {
      id: "sebastian-cole",
      name: "Sebastian Cole",
      portrait: "client-julian",
      persona: "Heritage Bespoke",
      persona_id: "heritage",
      store: "Bond St. Flagship",
      tier: "VIC · Tier II",
      lifetime_value: "£95,700",
      last_visit_days: 11,
      appointment_time: "17:00",
      status: "expected",
      garment_size: "UK 44R",
      shoe_size: "UK 10",
      preferences: ["Savile Row Heritage", "Navy / Charcoal", "Bespoke Shirting"],
      acquisitions: [
        { name: "Tailored Wool Trousers", season: "AW24", price: "£1,250", image: "product-overcoat" },
        { name: "Petit Grain Leather Belt", season: "SS24", price: "£320", image: "product-loafer" },
      ],
    },
    {
      id: "yuki-tanaka",
      name: "Yuki Tanaka",
      portrait: "client-isabelle",
      persona: "Editorial Modernist",
      persona_id: "editorial",
      store: "Bond St. Flagship",
      tier: "Private Client",
      lifetime_value: "£61,200",
      last_visit_days: 19,
      appointment_time: null,
      status: "expected",
      garment_size: "JP 7",
      shoe_size: "EU 36",
      preferences: ["Runway Pieces", "Monochrome", "Architectural"],
      acquisitions: [
        { name: "Silk Evening Chemise", season: "SS24", price: "£1,800", image: "product-tote" },
      ],
    },
    // ── Mayfair ───────────────────────────────────────────────────────────────
    {
      id: "sophia-laurent",
      name: "Sophia Laurent",
      portrait: "client-aria",
      persona: "Quiet Luxury Connoisseur",
      persona_id: "quiet-luxury",
      store: "Mayfair",
      tier: "VIC · Tier I",
      lifetime_value: "£118,200",
      last_visit_days: 9,
      appointment_time: null,
      status: "expected",
      garment_size: "FR 38",
      shoe_size: "EU 39",
      preferences: ["Cashmere", "Neutral Palette", "Understated Luxury"],
      acquisitions: [
        { name: "Structured Cashmere Overcoat", season: "AW24", price: "£3,450", image: "product-overcoat" },
      ],
    },
    {
      id: "henry-beaumont",
      name: "Henry Beaumont",
      portrait: "client-julian",
      persona: "Heritage Bespoke",
      persona_id: "heritage",
      store: "Mayfair",
      tier: "VIC · Tier II",
      lifetime_value: "£73,400",
      last_visit_days: 18,
      appointment_time: null,
      status: "expected",
      garment_size: "UK 40R",
      shoe_size: "UK 10",
      preferences: ["Made-to-Measure", "Navy", "British Heritage"],
      acquisitions: [
        { name: "Saddle Grain Calfskin Tote", season: "AW24", price: "£2,800", image: "product-tote" },
      ],
    },
    // ── Paris Faubourg ────────────────────────────────────────────────────────
    {
      id: "celeste-dubois",
      name: "Céleste Dubois",
      portrait: "client-isabelle",
      persona: "Editorial Modernist",
      persona_id: "editorial",
      store: "Paris Faubourg",
      tier: "VIC · Tier I",
      lifetime_value: "£196,800",
      last_visit_days: 3,
      appointment_time: null,
      status: "expected",
      garment_size: "FR 34",
      shoe_size: "EU 37",
      preferences: ["Runway Exclusives", "Monochrome", "Statement Pieces"],
      acquisitions: [
        { name: "Hand-Rolled Silk Scarf, Noir", season: "AW24", price: "£420", image: "product-scarf" },
        { name: "Structured Cashmere Overcoat", season: "SS24", price: "£3,450", image: "product-overcoat" },
      ],
    },
    {
      id: "pierre-moreau",
      name: "Pierre Moreau",
      portrait: "client-julian",
      persona: "Heritage Bespoke",
      persona_id: "heritage",
      store: "Paris Faubourg",
      tier: "Private Client",
      lifetime_value: "£62,100",
      last_visit_days: 21,
      appointment_time: null,
      status: "expected",
      garment_size: "EU 50",
      shoe_size: "EU 43",
      preferences: ["Atelier Provenance", "Charcoal", "Bespoke Only"],
      acquisitions: [
        { name: "Grained Calfskin Loafer", season: "AW24", price: "£1,100", image: "product-loafer" },
      ],
    },
    // ── New York Fifth Ave ─────────────────────────────────────────────────────
    {
      id: "victoria-hayes",
      name: "Victoria Hayes",
      portrait: "client-aria",
      persona: "Quiet Luxury Connoisseur",
      persona_id: "quiet-luxury",
      store: "New York Fifth Ave",
      tier: "VIC · Tier I",
      lifetime_value: "£231,400",
      last_visit_days: 5,
      appointment_time: null,
      status: "expected",
      garment_size: "US 6",
      shoe_size: "US 8",
      preferences: ["Minimal Branding", "Cashmere", "Tailoring"],
      acquisitions: [
        { name: "Saddle Grain Calfskin Tote", season: "AW24", price: "£2,800", image: "product-tote" },
        { name: "Structured Cashmere Overcoat", season: "AW24", price: "£3,450", image: "product-overcoat" },
      ],
    },
    {
      id: "james-whitfield",
      name: "James Whitfield",
      portrait: "client-julian",
      persona: "Heritage Bespoke",
      persona_id: "heritage",
      store: "New York Fifth Ave",
      tier: "VIC · Tier II",
      lifetime_value: "£104,700",
      last_visit_days: 11,
      appointment_time: null,
      status: "expected",
      garment_size: "US 42R",
      shoe_size: "US 11",
      preferences: ["Bespoke Tailoring", "British Heritage", "Dark Palette"],
      acquisitions: [
        { name: "Grained Calfskin Loafer", season: "AW24", price: "£1,100", image: "product-loafer" },
      ],
    },
  ];

  const recommendations: RecommendationRow[] = [
    {
      id: 1,
      client_id: "aria-sterling",
      product_id: "P-9912",
      affinity: 96,
      reasoning:
        "Matches her preference for architectural silhouettes and neutral tones. Pairs with the Silk Maxi Dress acquired in September 2023.",
      icebreaker:
        "I noticed the texture of this wool reminded me of the bespoke blazer you selected last autumn — would you like to see it on the form?",
      signals: ["High Affinity", "Restock arrival", "Persona match 98%"],
    },
    {
      id: 2,
      client_id: "aria-sterling",
      product_id: "P-4021",
      affinity: 87,
      reasoning:
        "A staple accessory that complements the 'Quiet Luxury' persona — zero branding, hand-stitched, ages beautifully.",
      icebreaker:
        "We just received a small run of unlined totes — knowing your appreciation for vegetable-tanned leather, I held one back.",
      signals: ["Complementary", "Persona match 91%"],
    },
    {
      id: 3,
      client_id: "aria-sterling",
      product_id: "P-7733",
      affinity: 74,
      reasoning:
        "Adds a discreet point of contrast to her predominantly tonal wardrobe. Suggested as a layering accent.",
      icebreaker:
        "If you'd like a quiet flourish for travel, this hand-rolled scarf reads beautifully over the camel coat.",
      signals: ["Wardrobe gap", "Gift-worthy"],
    },
    {
      id: 4,
      client_id: "julian-ashford",
      product_id: "P-2208",
      affinity: 92,
      reasoning:
        "Continues his three-season pattern of acquiring grained calfskin loafers. The new chocolate shade is on persona.",
      icebreaker:
        "The chocolate has arrived — I recall you mentioning you'd add a second pair if we ever sourced this shade.",
      signals: ["High Affinity", "Pattern match"],
    },
    {
      id: 5,
      client_id: "isabelle-moreau",
      product_id: "P-9912",
      affinity: 88,
      reasoning: "Architectural cashmere aligns with her editorial preferences for autumn layering.",
      icebreaker:
        "This silhouette photographs beautifully — I think it would carry well into your Paris trip next month.",
      signals: ["Persona match 88%"],
    },
    {
      id: 6,
      client_id: "margaux-fontaine",
      product_id: "P-3341",
      affinity: 91,
      reasoning:
        "The fine merino roll-neck aligns precisely with her preference for ivory palette and timeless knitwear with tactile quality.",
      icebreaker:
        "We have this in a very soft ivory — I think it would pair beautifully with what you acquired last season.",
      signals: ["High Affinity", "Palette match", "Persona match 91%"],
    },
    {
      id: 7,
      client_id: "margaux-fontaine",
      product_id: "P-4021",
      affinity: 78,
      reasoning:
        "A clean, unbranded tote complements her preference for understated accessories without visible hardware.",
      icebreaker:
        "This tote has no external branding — structured enough for the office, relaxed enough for a weekend in the country.",
      signals: ["Complementary", "No-logo preference"],
    },
    {
      id: 8,
      client_id: "sebastian-cole",
      product_id: "P-5502",
      affinity: 94,
      reasoning:
        "Tailored wool trousers directly match his Savile Row sensibility and three-season pattern of acquiring heritage tailoring pieces.",
      icebreaker:
        "These have just arrived from the atelier — the chalk stripe is subtle enough for daily wear but formal enough for the Garrick.",
      signals: ["High Affinity", "Heritage match", "Repeat pattern"],
    },
    {
      id: 9,
      client_id: "sebastian-cole",
      product_id: "P-1108",
      affinity: 82,
      reasoning:
        "A well-finished leather belt to complete the tailored look. Pairs with his recent trouser acquisition.",
      icebreaker:
        "The stitching on this belt matches the thread used in the trouser waistband — they were designed as a pair.",
      signals: ["Complementary", "Set completion"],
    },
    {
      id: 10,
      client_id: "yuki-tanaka",
      product_id: "P-6671",
      affinity: 89,
      reasoning:
        "The silk chemise is a runway-adjacent piece with architectural drape — precisely her brief for editorial dressing.",
      icebreaker:
        "This piece was worn in the Paris show — it photographs very differently depending on how it is draped.",
      signals: ["Editorial match", "Persona match 89%", "Runway lineage"],
    },
    {
      id: 11,
      client_id: "yuki-tanaka",
      product_id: "P-9912",
      affinity: 76,
      reasoning:
        "The overcoat adds a structural silhouette layer to her evening wardrobe — consistent with her preference for monochrome statement pieces.",
      icebreaker:
        "Layered over the chemise, this creates the kind of contrast that reads very well on camera.",
      signals: ["Layering potential", "Wardrobe gap"],
    },
  ];

  saveAll(KEYS.personas, personas);
  saveAll(KEYS.clients, clients);
  saveAll(KEYS.products, products);
  saveAll(KEYS.recommendations, recommendations);
  localStorage.setItem(KEYS.seeded, "true");
}
