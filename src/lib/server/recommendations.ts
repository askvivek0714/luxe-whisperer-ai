import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/lib/db";

export type RecommendationRow = {
  id: number;
  client_id: string;
  product_id: string;
  affinity: number;
  reasoning: string;
  icebreaker: string;
  signals: string[];
};

export type RecommendationInput = {
  client_id: string;
  product_id: string;
  affinity: number;
  reasoning?: string;
  icebreaker?: string;
  signals?: string[];
};

function hydrate(row: Omit<RecommendationRow, "signals">): RecommendationRow {
  const db = getDb();
  const signals = (
    db
      .prepare(
        "SELECT signal FROM recommendation_signals WHERE recommendation_id = ? ORDER BY id ASC",
      )
      .all(row.id) as { signal: string }[]
  ).map((r) => r.signal);
  return { ...row, signals };
}

export const listRecommendations = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM recommendations ORDER BY affinity DESC")
    .all() as Omit<RecommendationRow, "signals">[];
  return rows.map(hydrate);
});

export const listRecommendationsForClient = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { clientId: string } }) => {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM recommendations WHERE client_id = ? ORDER BY affinity DESC")
      .all(data.clientId) as Omit<RecommendationRow, "signals">[];
    return rows.map(hydrate);
  },
);

export const createRecommendation = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: RecommendationInput }) => {
    const db = getDb();
    const result = db
      .prepare(`
        INSERT INTO recommendations (client_id, product_id, affinity, reasoning, icebreaker)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        data.client_id,
        data.product_id,
        data.affinity,
        data.reasoning ?? "",
        data.icebreaker ?? "",
      );
    const id = result.lastInsertRowid as number;
    if (data.signals?.length) {
      const stmt = db.prepare(
        "INSERT INTO recommendation_signals (recommendation_id, signal) VALUES (?, ?)",
      );
      for (const s of data.signals) stmt.run(id, s);
    }
    return { id };
  },
);

export const updateRecommendation = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: RecommendationInput & { id: number } }) => {
    const db = getDb();
    db.prepare(`
      UPDATE recommendations SET client_id=?, product_id=?, affinity=?, reasoning=?, icebreaker=?
      WHERE id=?
    `).run(
      data.client_id,
      data.product_id,
      data.affinity,
      data.reasoning ?? "",
      data.icebreaker ?? "",
      data.id,
    );
    if (data.signals !== undefined) {
      db.prepare("DELETE FROM recommendation_signals WHERE recommendation_id = ?").run(data.id);
      const stmt = db.prepare(
        "INSERT INTO recommendation_signals (recommendation_id, signal) VALUES (?, ?)",
      );
      for (const s of data.signals) stmt.run(data.id, s);
    }
    return { ok: true };
  },
);

export const deleteRecommendation = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { id: number } }) => {
    const db = getDb();
    db.prepare("DELETE FROM recommendations WHERE id = ?").run(data.id);
    return { ok: true };
  },
);
