import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/lib/db";

export type PersonaRow = {
  id: string;
  name: string;
  description: string;
  client_count: number;
  weights: { label: string; value: number }[];
  guardrails: string[];
};

export type PersonaInput = {
  id?: string;
  name: string;
  description?: string;
  client_count?: number;
  weights?: { label: string; value: number }[];
  guardrails?: string[];
};

function hydrate(row: Omit<PersonaRow, "weights" | "guardrails">): PersonaRow {
  const db = getDb();
  const weights = db
    .prepare("SELECT label, value FROM persona_weights WHERE persona_id = ? ORDER BY id ASC")
    .all(row.id) as { label: string; value: number }[];
  const guardrails = (
    db
      .prepare(
        "SELECT guardrail FROM persona_guardrails WHERE persona_id = ? ORDER BY id ASC",
      )
      .all(row.id) as { guardrail: string }[]
  ).map((r) => r.guardrail);
  return { ...row, weights, guardrails };
}

export const listPersonas = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM personas ORDER BY name ASC").all() as Omit<
    PersonaRow,
    "weights" | "guardrails"
  >[];
  return rows.map(hydrate);
});

export const getPersona = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    const row = db.prepare("SELECT * FROM personas WHERE id = ?").get(data.id) as
      | Omit<PersonaRow, "weights" | "guardrails">
      | undefined;
    if (!row) return null;
    return hydrate(row);
  },
);

export const createPersona = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: PersonaInput }) => {
    const db = getDb();
    const id =
      data.id ??
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    db.prepare(
      "INSERT INTO personas (id, name, description, client_count) VALUES (?, ?, ?, ?)",
    ).run(id, data.name, data.description ?? "", data.client_count ?? 0);
    if (data.weights?.length) {
      const stmt = db.prepare(
        "INSERT INTO persona_weights (persona_id, label, value) VALUES (?, ?, ?)",
      );
      for (const w of data.weights) stmt.run(id, w.label, w.value);
    }
    if (data.guardrails?.length) {
      const stmt = db.prepare(
        "INSERT INTO persona_guardrails (persona_id, guardrail) VALUES (?, ?)",
      );
      for (const g of data.guardrails) stmt.run(id, g);
    }
    return { id };
  },
);

export const updatePersona = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: PersonaInput & { id: string } }) => {
    const db = getDb();
    db.prepare("UPDATE personas SET name=?, description=?, client_count=? WHERE id=?").run(
      data.name,
      data.description ?? "",
      data.client_count ?? 0,
      data.id,
    );
    if (data.weights !== undefined) {
      db.prepare("DELETE FROM persona_weights WHERE persona_id = ?").run(data.id);
      const stmt = db.prepare(
        "INSERT INTO persona_weights (persona_id, label, value) VALUES (?, ?, ?)",
      );
      for (const w of data.weights) stmt.run(data.id, w.label, w.value);
    }
    if (data.guardrails !== undefined) {
      db.prepare("DELETE FROM persona_guardrails WHERE persona_id = ?").run(data.id);
      const stmt = db.prepare(
        "INSERT INTO persona_guardrails (persona_id, guardrail) VALUES (?, ?)",
      );
      for (const g of data.guardrails) stmt.run(data.id, g);
    }
    return { ok: true };
  },
);

export const deletePersona = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    db.prepare("DELETE FROM personas WHERE id = ?").run(data.id);
    return { ok: true };
  },
);
