import ariaPortrait from "@/assets/client-aria.jpg";
import julianPortrait from "@/assets/client-julian.jpg";
import isabellePortrait from "@/assets/client-isabelle.jpg";
import overcoat from "@/assets/product-overcoat.jpg";
import tote from "@/assets/product-tote.jpg";
import scarf from "@/assets/product-scarf.jpg";
import loafer from "@/assets/product-loafer.jpg";

export type Client = {
  id: string;
  name: string;
  portrait: string;
  persona: string;
  personaId: string;
  tier: string;
  lifetimeValue: string;
  lastVisitDays: number;
  appointmentTime?: string;
  status: "arrived" | "expected" | "browsing";
  preferences: string[];
  sizes: { garment: string; shoe: string };
  recentAcquisitions: { name: string; season: string; price: string; image: string }[];
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: string;
  image: string;
  stock: { floor: number; vault: number };
};

export type Recommendation = {
  productId: string;
  affinity: number;
  reasoning: string;
  signals: string[];
  icebreaker: string;
};

export const products: Record<string, Product> = {
  "P-9912": {
    id: "P-9912",
    sku: "9912-VIC",
    name: "Structured Cashmere Overcoat",
    category: "Outerwear",
    price: "£3,450",
    image: overcoat,
    stock: { floor: 1, vault: 1 },
  },
  "P-4021": {
    id: "P-4021",
    sku: "4021-CHE",
    name: "Saddle Grain Calfskin Tote",
    category: "Leather Goods",
    price: "£2,800",
    image: tote,
    stock: { floor: 2, vault: 0 },
  },
  "P-7733": {
    id: "P-7733",
    sku: "7733-NOR",
    name: "Hand-Rolled Silk Scarf, Noir",
    category: "Accessories",
    price: "£420",
    image: scarf,
    stock: { floor: 4, vault: 2 },
  },
  "P-2208": {
    id: "P-2208",
    sku: "2208-CHO",
    name: "Grained Calfskin Loafer",
    category: "Footwear",
    price: "£1,100",
    image: loafer,
    stock: { floor: 1, vault: 3 },
  },
};

export const clients: Client[] = [
  {
    id: "aria-sterling",
    name: "Aria Sterling",
    portrait: ariaPortrait,
    persona: "Quiet Luxury Connoisseur",
    personaId: "quiet-luxury",
    tier: "VIC · Tier I",
    lifetimeValue: "£142,500",
    lastVisitDays: 14,
    appointmentTime: "14:30",
    status: "arrived",
    preferences: ["Virgin Wool", "Oversized Fit", "Beige / Taupe Palette", "No Logos"],
    sizes: { garment: "IT 40", shoe: "EU 38" },
    recentAcquisitions: [
      { name: "Nappa Calfskin Tote", season: "AW24", price: "£3,450", image: tote },
      { name: "Silk Maxi Dress", season: "SS24", price: "£2,200", image: scarf },
    ],
  },
  {
    id: "julian-ashford",
    name: "Julian Ashford",
    portrait: julianPortrait,
    persona: "Heritage Bespoke",
    personaId: "heritage",
    tier: "VIC · Tier II",
    lifetimeValue: "£89,200",
    lastVisitDays: 27,
    appointmentTime: "15:15",
    status: "expected",
    preferences: ["Made-to-Measure", "Charcoal / Navy", "Brogue Detailing"],
    sizes: { garment: "UK 42R", shoe: "UK 9.5" },
    recentAcquisitions: [
      { name: "Grained Calfskin Loafer", season: "AW24", price: "£1,100", image: loafer },
    ],
  },
  {
    id: "isabelle-moreau",
    name: "Isabelle Moreau",
    portrait: isabellePortrait,
    persona: "Editorial Modernist",
    personaId: "editorial",
    tier: "Private Client",
    lifetimeValue: "£54,800",
    lastVisitDays: 6,
    appointmentTime: "16:00",
    status: "expected",
    preferences: ["Architectural Silhouettes", "Monochrome", "Statement Outerwear"],
    sizes: { garment: "FR 36", shoe: "EU 37" },
    recentAcquisitions: [
      { name: "Hand-Rolled Silk Scarf", season: "AW24", price: "£420", image: scarf },
    ],
  },
];

export const recommendationsByClient: Record<string, Recommendation[]> = {
  "aria-sterling": [
    {
      productId: "P-9912",
      affinity: 96,
      reasoning:
        "Matches her preference for architectural silhouettes and neutral tones. Pairs with the Silk Maxi Dress acquired in September 2023.",
      signals: ["High Affinity", "Restock arrival", "Persona match 98%"],
      icebreaker:
        "I noticed the texture of this wool reminded me of the bespoke blazer you selected last autumn — would you like to see it on the form?",
    },
    {
      productId: "P-4021",
      affinity: 87,
      reasoning:
        "A staple accessory that complements the 'Quiet Luxury' persona — zero branding, hand-stitched, ages beautifully.",
      signals: ["Complementary", "Persona match 91%"],
      icebreaker:
        "We just received a small run of unlined totes — knowing your appreciation for vegetable-tanned leather, I held one back.",
    },
    {
      productId: "P-7733",
      affinity: 74,
      reasoning:
        "Adds a discreet point of contrast to her predominantly tonal wardrobe. Suggested as a layering accent.",
      signals: ["Wardrobe gap", "Gift-worthy"],
      icebreaker:
        "If you'd like a quiet flourish for travel, this hand-rolled scarf reads beautifully over the camel coat.",
    },
  ],
  "julian-ashford": [
    {
      productId: "P-2208",
      affinity: 92,
      reasoning:
        "Continues his three-season pattern of acquiring grained calfskin loafers. The new chocolate shade is on persona.",
      signals: ["High Affinity", "Pattern match"],
      icebreaker:
        "The chocolate has arrived — I recall you mentioning you'd add a second pair if we ever sourced this shade.",
    },
  ],
  "isabelle-moreau": [
    {
      productId: "P-9912",
      affinity: 88,
      reasoning:
        "Architectural cashmere aligns with her editorial preferences for autumn layering.",
      signals: ["Persona match 88%"],
      icebreaker:
        "This silhouette photographs beautifully — I think it would carry well into your Paris trip next month.",
    },
  ],
};

export type Persona = {
  id: string;
  name: string;
  description: string;
  clientCount: number;
  weights: { label: string; value: number }[];
  guardrails: string[];
};

export const personas: Persona[] = [
  {
    id: "quiet-luxury",
    name: "Quiet Luxury Connoisseur",
    description:
      "Values tactile materiality over logos. Prefers private fitting suites and pre-orders off-runway pieces.",
    clientCount: 47,
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
    clientCount: 23,
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
    clientCount: 31,
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
