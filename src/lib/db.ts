import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "luxe.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initSchema(_db);
  seedIfEmpty(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      client_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS persona_weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS persona_guardrails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      guardrail TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      portrait TEXT,
      persona TEXT,
      persona_id TEXT REFERENCES personas(id),
      tier TEXT,
      lifetime_value TEXT,
      last_visit_days INTEGER DEFAULT 0,
      appointment_time TEXT,
      status TEXT DEFAULT 'expected',
      garment_size TEXT,
      shoe_size TEXT
    );

    CREATE TABLE IF NOT EXISTS client_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      preference TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS client_acquisitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      season TEXT,
      price TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      price TEXT,
      image TEXT,
      floor_stock INTEGER DEFAULT 0,
      vault_stock INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      affinity INTEGER NOT NULL,
      reasoning TEXT,
      icebreaker TEXT
    );

    CREATE TABLE IF NOT EXISTS recommendation_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
      signal TEXT NOT NULL
    );
  `);
}

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as n FROM clients").get() as { n: number }).n;
  if (count > 0) return;

  const insertPersona = db.prepare(
    "INSERT INTO personas (id, name, description, client_count) VALUES (?, ?, ?, ?)",
  );
  const insertWeight = db.prepare(
    "INSERT INTO persona_weights (persona_id, label, value) VALUES (?, ?, ?)",
  );
  const insertGuardrail = db.prepare(
    "INSERT INTO persona_guardrails (persona_id, guardrail) VALUES (?, ?)",
  );
  const insertClient = db.prepare(`
    INSERT INTO clients (id, name, portrait, persona, persona_id, tier, lifetime_value,
      last_visit_days, appointment_time, status, garment_size, shoe_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPref = db.prepare(
    "INSERT INTO client_preferences (client_id, preference) VALUES (?, ?)",
  );
  const insertAcq = db.prepare(`
    INSERT INTO client_acquisitions (client_id, name, season, price, image)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertProduct = db.prepare(`
    INSERT INTO products (id, sku, name, category, price, image, floor_stock, vault_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRec = db.prepare(`
    INSERT INTO recommendations (client_id, product_id, affinity, reasoning, icebreaker)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertSignal = db.prepare(
    "INSERT INTO recommendation_signals (recommendation_id, signal) VALUES (?, ?)",
  );

  const seed = db.transaction(() => {
    // Personas
    insertPersona.run(
      "quiet-luxury",
      "Quiet Luxury Connoisseur",
      "Values tactile materiality over logos. Prefers private fitting suites and pre-orders off-runway pieces.",
      47,
    );
    for (const [label, value] of [
      ["Visual Minimalism", 85],
      ["Brand Salience", 12],
      ["Heritage & Craft", 92],
      ["Newness Appetite", 38],
    ]) insertWeight.run("quiet-luxury", label, value);
    for (const g of [
      "Avoid adjectives like 'trendy', 'viral', or 'must-have'.",
      "Focus on heritage, craftsmanship, and longevity.",
      "Suggest complimentary gift wrapping only on items >£5k.",
    ]) insertGuardrail.run("quiet-luxury", g);

    insertPersona.run(
      "heritage",
      "Heritage Bespoke",
      "Loyal to tailoring traditions. Books made-to-measure twice yearly. Prefers in-person consultations.",
      23,
    );
    for (const [label, value] of [
      ["Visual Minimalism", 60],
      ["Brand Salience", 25],
      ["Heritage & Craft", 98],
      ["Newness Appetite", 20],
    ]) insertWeight.run("heritage", label, value);
    for (const g of [
      "Reference archive and atelier provenance.",
      "Never recommend ready-to-wear when bespoke is available.",
    ]) insertGuardrail.run("heritage", g);

    insertPersona.run(
      "editorial",
      "Editorial Modernist",
      "Follows runway. Buys statement pieces with sharp silhouettes. Often photographed at industry events.",
      31,
    );
    for (const [label, value] of [
      ["Visual Minimalism", 55],
      ["Brand Salience", 70],
      ["Heritage & Craft", 65],
      ["Newness Appetite", 88],
    ]) insertWeight.run("editorial", label, value);
    for (const g of [
      "Surface runway-exclusive and limited-edition pieces first.",
      "Reference editorial placements where relevant.",
    ]) insertGuardrail.run("editorial", g);

    // Products
    insertProduct.run("P-9912", "9912-VIC", "Structured Cashmere Overcoat", "Outerwear", "£3,450", "product-overcoat", 1, 1);
    insertProduct.run("P-4021", "4021-CHE", "Saddle Grain Calfskin Tote", "Leather Goods", "£2,800", "product-tote", 2, 0);
    insertProduct.run("P-7733", "7733-NOR", "Hand-Rolled Silk Scarf, Noir", "Accessories", "£420", "product-scarf", 4, 2);
    insertProduct.run("P-2208", "2208-CHO", "Grained Calfskin Loafer", "Footwear", "£1,100", "product-loafer", 1, 3);

    // Clients
    insertClient.run("aria-sterling", "Aria Sterling", "client-aria", "Quiet Luxury Connoisseur", "quiet-luxury", "VIC · Tier I", "£142,500", 14, "14:30", "arrived", "IT 40", "EU 38");
    for (const p of ["Virgin Wool", "Oversized Fit", "Beige / Taupe Palette", "No Logos"])
      insertPref.run("aria-sterling", p);
    insertAcq.run("aria-sterling", "Nappa Calfskin Tote", "AW24", "£3,450", "product-tote");
    insertAcq.run("aria-sterling", "Silk Maxi Dress", "SS24", "£2,200", "product-scarf");

    insertClient.run("julian-ashford", "Julian Ashford", "client-julian", "Heritage Bespoke", "heritage", "VIC · Tier II", "£89,200", 27, "15:15", "expected", "UK 42R", "UK 9.5");
    for (const p of ["Made-to-Measure", "Charcoal / Navy", "Brogue Detailing"])
      insertPref.run("julian-ashford", p);
    insertAcq.run("julian-ashford", "Grained Calfskin Loafer", "AW24", "£1,100", "product-loafer");

    insertClient.run("isabelle-moreau", "Isabelle Moreau", "client-isabelle", "Editorial Modernist", "editorial", "Private Client", "£54,800", 6, "16:00", "expected", "FR 36", "EU 37");
    for (const p of ["Architectural Silhouettes", "Monochrome", "Statement Outerwear"])
      insertPref.run("isabelle-moreau", p);
    insertAcq.run("isabelle-moreau", "Hand-Rolled Silk Scarf", "AW24", "£420", "product-scarf");

    // Recommendations
    const r1 = (insertRec.run("aria-sterling", "P-9912", 96,
      "Matches her preference for architectural silhouettes and neutral tones. Pairs with the Silk Maxi Dress acquired in September 2023.",
      "I noticed the texture of this wool reminded me of the bespoke blazer you selected last autumn — would you like to see it on the form?",
    ).lastInsertRowid) as number;
    for (const s of ["High Affinity", "Restock arrival", "Persona match 98%"])
      insertSignal.run(r1, s);

    const r2 = (insertRec.run("aria-sterling", "P-4021", 87,
      "A staple accessory that complements the 'Quiet Luxury' persona — zero branding, hand-stitched, ages beautifully.",
      "We just received a small run of unlined totes — knowing your appreciation for vegetable-tanned leather, I held one back.",
    ).lastInsertRowid) as number;
    for (const s of ["Complementary", "Persona match 91%"]) insertSignal.run(r2, s);

    const r3 = (insertRec.run("aria-sterling", "P-7733", 74,
      "Adds a discreet point of contrast to her predominantly tonal wardrobe. Suggested as a layering accent.",
      "If you'd like a quiet flourish for travel, this hand-rolled scarf reads beautifully over the camel coat.",
    ).lastInsertRowid) as number;
    for (const s of ["Wardrobe gap", "Gift-worthy"]) insertSignal.run(r3, s);

    const r4 = (insertRec.run("julian-ashford", "P-2208", 92,
      "Continues his three-season pattern of acquiring grained calfskin loafers. The new chocolate shade is on persona.",
      "The chocolate has arrived — I recall you mentioning you'd add a second pair if we ever sourced this shade.",
    ).lastInsertRowid) as number;
    for (const s of ["High Affinity", "Pattern match"]) insertSignal.run(r4, s);

    const r5 = (insertRec.run("isabelle-moreau", "P-9912", 88,
      "Architectural cashmere aligns with her editorial preferences for autumn layering.",
      "This silhouette photographs beautifully — I think it would carry well into your Paris trip next month.",
    ).lastInsertRowid) as number;
    insertSignal.run(r5, "Persona match 88%");
  });

  seed();
}
