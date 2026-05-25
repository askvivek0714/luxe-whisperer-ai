import { store, ensureSeeded } from "@/lib/storage";

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

export async function listRecommendations(): Promise<RecommendationRow[]> {
  ensureSeeded();
  return store.recommendations.list().sort((a, b) => b.affinity - a.affinity);
}

export async function listRecommendationsForClient({
  data,
}: {
  data: { clientId: string };
}): Promise<RecommendationRow[]> {
  ensureSeeded();
  return store.recommendations
    .list()
    .filter((r) => r.client_id === data.clientId)
    .sort((a, b) => b.affinity - a.affinity);
}

export async function createRecommendation({
  data,
}: {
  data: RecommendationInput;
}): Promise<{ id: number }> {
  ensureSeeded();
  const recs = store.recommendations.list();
  const id = recs.length > 0 ? Math.max(...recs.map((r) => r.id)) + 1 : 1;
  const newRec: RecommendationRow = {
    id,
    client_id: data.client_id,
    product_id: data.product_id,
    affinity: data.affinity,
    reasoning: data.reasoning ?? "",
    icebreaker: data.icebreaker ?? "",
    signals: data.signals ?? [],
  };
  store.recommendations.save([...recs, newRec]);
  return { id };
}

export async function updateRecommendation({
  data,
}: {
  data: RecommendationInput & { id: number };
}): Promise<{ ok: true }> {
  ensureSeeded();
  const recs = store.recommendations.list();
  const existing = recs.find((r) => r.id === data.id);
  if (!existing) throw new Error("Recommendation not found");
  const updated: RecommendationRow = {
    ...existing,
    client_id: data.client_id,
    product_id: data.product_id,
    affinity: data.affinity,
    reasoning: data.reasoning ?? existing.reasoning,
    icebreaker: data.icebreaker ?? existing.icebreaker,
    signals: data.signals ?? existing.signals,
  };
  store.recommendations.save(recs.map((r) => (r.id === data.id ? updated : r)));
  return { ok: true };
}

export async function deleteRecommendation({
  data,
}: {
  data: { id: number };
}): Promise<{ ok: true }> {
  ensureSeeded();
  store.recommendations.save(store.recommendations.list().filter((r) => r.id !== data.id));
  return { ok: true };
}
