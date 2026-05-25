import { store, ensureSeeded } from "@/lib/storage";

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

export async function listPersonas(): Promise<PersonaRow[]> {
  ensureSeeded();
  return store.personas.list().sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPersona({
  data,
}: {
  data: { id: string };
}): Promise<PersonaRow | null> {
  ensureSeeded();
  return store.personas.get(data.id);
}

export async function createPersona({
  data,
}: {
  data: PersonaInput;
}): Promise<{ id: string }> {
  ensureSeeded();
  const id =
    data.id ??
    data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const newPersona: PersonaRow = {
    id,
    name: data.name,
    description: data.description ?? "",
    client_count: data.client_count ?? 0,
    weights: data.weights ?? [],
    guardrails: data.guardrails ?? [],
  };
  store.personas.save([...store.personas.list(), newPersona]);
  return { id };
}

export async function updatePersona({
  data,
}: {
  data: PersonaInput & { id: string };
}): Promise<{ ok: true }> {
  ensureSeeded();
  const personas = store.personas.list();
  const existing = personas.find((p) => p.id === data.id);
  if (!existing) throw new Error("Persona not found");
  const updated: PersonaRow = {
    ...existing,
    name: data.name,
    description: data.description ?? existing.description,
    client_count: data.client_count ?? existing.client_count,
    weights: data.weights ?? existing.weights,
    guardrails: data.guardrails ?? existing.guardrails,
  };
  store.personas.save(personas.map((p) => (p.id === data.id ? updated : p)));
  return { ok: true };
}

export async function deletePersona({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  ensureSeeded();
  store.personas.save(store.personas.list().filter((p) => p.id !== data.id));
  return { ok: true };
}
