"use server";
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/lib/db";

export type ClientRow = {
  id: string;
  name: string;
  portrait: string;
  persona: string;
  persona_id: string;
  tier: string;
  lifetime_value: string;
  last_visit_days: number;
  appointment_time: string | null;
  status: "arrived" | "expected" | "browsing";
  garment_size: string;
  shoe_size: string;
  preferences: string[];
  acquisitions: { name: string; season: string; price: string; image: string }[];
};

export type ClientInput = {
  id?: string;
  name: string;
  portrait?: string;
  persona?: string;
  persona_id?: string;
  tier?: string;
  lifetime_value?: string;
  last_visit_days?: number;
  appointment_time?: string;
  status?: "arrived" | "expected" | "browsing";
  garment_size?: string;
  shoe_size?: string;
  preferences?: string[];
};

function hydrate(row: Omit<ClientRow, "preferences" | "acquisitions">): ClientRow {
  const db = getDb();
  const preferences = (
    db.prepare("SELECT preference FROM client_preferences WHERE client_id = ?").all(row.id) as {
      preference: string;
    }[]
  ).map((r) => r.preference);
  const acquisitions = db
    .prepare("SELECT name, season, price, image FROM client_acquisitions WHERE client_id = ?")
    .all(row.id) as ClientRow["acquisitions"];
  return { ...row, preferences, acquisitions };
}

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM clients ORDER BY appointment_time ASC NULLS LAST")
    .all() as Omit<ClientRow, "preferences" | "acquisitions">[];
  return rows.map(hydrate);
});

export const getClient = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(data.id) as
      | Omit<ClientRow, "preferences" | "acquisitions">
      | undefined;
    if (!row) return null;
    return hydrate(row);
  },
);

export const createClient = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: ClientInput }) => {
    const db = getDb();
    const id =
      data.id ??
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    db.prepare(`
      INSERT INTO clients (id, name, portrait, persona, persona_id, tier, lifetime_value,
        last_visit_days, appointment_time, status, garment_size, shoe_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.portrait ?? "",
      data.persona ?? "",
      data.persona_id ?? "",
      data.tier ?? "",
      data.lifetime_value ?? "",
      data.last_visit_days ?? 0,
      data.appointment_time ?? null,
      data.status ?? "expected",
      data.garment_size ?? "",
      data.shoe_size ?? "",
    );
    if (data.preferences?.length) {
      const stmt = db.prepare(
        "INSERT INTO client_preferences (client_id, preference) VALUES (?, ?)",
      );
      for (const p of data.preferences) stmt.run(id, p);
    }
    return { id };
  },
);

export const updateClient = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: ClientInput & { id: string } }) => {
    const db = getDb();
    db.prepare(`
      UPDATE clients SET name=?, portrait=?, persona=?, persona_id=?, tier=?, lifetime_value=?,
        last_visit_days=?, appointment_time=?, status=?, garment_size=?, shoe_size=?
      WHERE id=?
    `).run(
      data.name,
      data.portrait ?? "",
      data.persona ?? "",
      data.persona_id ?? "",
      data.tier ?? "",
      data.lifetime_value ?? "",
      data.last_visit_days ?? 0,
      data.appointment_time ?? null,
      data.status ?? "expected",
      data.garment_size ?? "",
      data.shoe_size ?? "",
      data.id,
    );
    if (data.preferences !== undefined) {
      db.prepare("DELETE FROM client_preferences WHERE client_id = ?").run(data.id);
      const stmt = db.prepare(
        "INSERT INTO client_preferences (client_id, preference) VALUES (?, ?)",
      );
      for (const p of data.preferences) stmt.run(data.id, p);
    }
    return { ok: true };
  },
);

export const deleteClient = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    db.prepare("DELETE FROM clients WHERE id = ?").run(data.id);
    return { ok: true };
  },
);
