import { store, ensureSeeded } from "@/lib/storage";

export type ClientRow = {
  id: string;
  name: string;
  portrait: string;
  persona: string;
  persona_id: string | null;
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

export async function listClients(): Promise<ClientRow[]> {
  ensureSeeded();
  return store.clients
    .list()
    .sort((a, b) =>
      a.appointment_time && b.appointment_time
        ? a.appointment_time.localeCompare(b.appointment_time)
        : a.appointment_time
          ? -1
          : 1,
    );
}

export async function getClient({ data }: { data: { id: string } }): Promise<ClientRow | null> {
  ensureSeeded();
  return store.clients.get(data.id);
}

export async function createClient({ data }: { data: ClientInput }): Promise<{ id: string }> {
  ensureSeeded();
  const id =
    data.id ??
    data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const clients = store.clients.list();
  if (clients.find((c) => c.id === id)) throw new Error("UNIQUE constraint failed: clients.id");
  const newClient: ClientRow = {
    id,
    name: data.name,
    portrait: data.portrait ?? "",
    persona: data.persona ?? "",
    persona_id: data.persona_id ?? null,
    tier: data.tier ?? "",
    lifetime_value: data.lifetime_value ?? "",
    last_visit_days: data.last_visit_days ?? 0,
    appointment_time: data.appointment_time ?? null,
    status: data.status ?? "expected",
    garment_size: data.garment_size ?? "",
    shoe_size: data.shoe_size ?? "",
    preferences: data.preferences ?? [],
    acquisitions: [],
  };
  store.clients.save([...clients, newClient]);
  return { id };
}

export async function updateClient({
  data,
}: {
  data: ClientInput & { id: string };
}): Promise<{ ok: true }> {
  ensureSeeded();
  const clients = store.clients.list();
  const existing = clients.find((c) => c.id === data.id);
  if (!existing) throw new Error("Client not found");
  const updated: ClientRow = {
    ...existing,
    name: data.name,
    portrait: data.portrait ?? existing.portrait,
    persona: data.persona ?? existing.persona,
    persona_id: data.persona_id ?? null,
    tier: data.tier ?? existing.tier,
    lifetime_value: data.lifetime_value ?? existing.lifetime_value,
    last_visit_days: data.last_visit_days ?? existing.last_visit_days,
    appointment_time: data.appointment_time ?? null,
    status: data.status ?? existing.status,
    garment_size: data.garment_size ?? existing.garment_size,
    shoe_size: data.shoe_size ?? existing.shoe_size,
    preferences: data.preferences ?? existing.preferences,
  };
  store.clients.save(clients.map((c) => (c.id === data.id ? updated : c)));
  return { ok: true };
}

export async function deleteClient({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  ensureSeeded();
  store.clients.save(store.clients.list().filter((c) => c.id !== data.id));
  // cascade: delete recommendations for this client
  const { store: s } = await import("@/lib/storage");
  s.recommendations.save(s.recommendations.list().filter((r) => r.client_id !== data.id));
  return { ok: true };
}
