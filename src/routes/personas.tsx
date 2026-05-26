import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { listPersonas, updatePersona, createPersona, deletePersona, type PersonaRow } from "@/lib/fns/personas";
import { useRole, can } from "@/lib/rbac";

export const Route = createFileRoute("/personas")({
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: (search.highlight as string) || undefined,
  }),
  loader: () => listPersonas(),
  component: PersonaStudio,
  head: () => ({
    meta: [
      { title: "Persona Studio · Maison Vaurien" },
      {
        name: "description",
        content: "Tune persona weights and brand-voice guardrails for Claude-powered recommendations.",
      },
    ],
  }),
});

function PersonaStudio() {
  const initialPersonas = Route.useLoaderData();
  const { highlight } = Route.useSearch();
  const router = useRouter();
  const { role } = useRole();
  const canEdit = can(role, "persona.edit");
  const canPublish = can(role, "persona.publish");
  const canCreate = can(role, "persona.create");

  const [personas, setPersonas] = useState<PersonaRow[]>(initialPersonas);
  const [activeId, setActiveId] = useState(highlight ?? personas[0]?.id ?? "");
  const [weights, setWeights] = useState<Record<string, PersonaRow["weights"]>>(
    Object.fromEntries(personas.map((p) => [p.id, p.weights])),
  );
  const [guardrails, setGuardrails] = useState<Record<string, string[]>>(
    Object.fromEntries(personas.map((p) => [p.id, p.guardrails])),
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showNewPersona, setShowNewPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaDesc, setNewPersonaDesc] = useState("");
  const [newGuardrail, setNewGuardrail] = useState("");
  const [createSubmitted, setCreateSubmitted] = useState(false);

  const active = personas.find((p) => p.id === activeId);
  const currentWeights = active ? (weights[active.id] ?? active.weights) : [];
  const currentGuardrails = active ? (guardrails[active.id] ?? active.guardrails) : [];

  const setWeight = (label: string, value: number) => {
    if (!canEdit || !active) return;
    setWeights((w) => ({
      ...w,
      [active.id]: w[active.id].map((x) => (x.label === label ? { ...x, value } : x)),
    }));
  };

  const removeGuardrail = (g: string) => {
    if (!canEdit || !active) return;
    setGuardrails((gs) => ({
      ...gs,
      [active.id]: gs[active.id].filter((x) => x !== g),
    }));
  };

  const addGuardrail = () => {
    if (!canEdit || !active || !newGuardrail.trim()) return;
    setGuardrails((gs) => ({
      ...gs,
      [active.id]: [...(gs[active.id] ?? []), newGuardrail.trim()],
    }));
    setNewGuardrail("");
  };

  const handleRevert = () => {
    if (!active) return;
    setWeights((w) => ({ ...w, [active.id]: active.weights }));
    setGuardrails((gs) => ({ ...gs, [active.id]: active.guardrails }));
  };

  const handleSave = async (publish = false) => {
    if (!active) return;
    setSaving(true);
    try {
      await updatePersona({
        data: {
          id: active.id,
          name: active.name,
          description: active.description,
          client_count: active.client_count,
          weights: currentWeights,
          guardrails: currentGuardrails,
        },
      });
      await router.invalidate();
      const refreshed = await listPersonas();
      setPersonas(refreshed);
      setWeights(Object.fromEntries(refreshed.map((p) => [p.id, p.weights])));
      setGuardrails(Object.fromEntries(refreshed.map((p) => [p.id, p.guardrails])));
      toast.success(publish ? "Persona published" : "Persona saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save persona");
    } finally {
      setSaving(false);
    }
    void publish;
  };

  const handleDelete = async () => {
    if (!active) return;
    try {
      await deletePersona({ data: { id: active.id } });
      await router.invalidate();
      const refreshed = await listPersonas();
      setPersonas(refreshed);
      setActiveId(refreshed[0]?.id ?? "");
      setWeights(Object.fromEntries(refreshed.map((p) => [p.id, p.weights])));
      setGuardrails(Object.fromEntries(refreshed.map((p) => [p.id, p.guardrails])));
      setConfirmDelete(false);
      toast.success("Persona deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete persona");
      setConfirmDelete(false);
    }
  };

  const handleCreate = async () => {
    setCreateSubmitted(true);
    if (!newPersonaName.trim()) return;
    try {
      const { id } = await createPersona({
        data: {
          name: newPersonaName.trim(),
          description: newPersonaDesc.trim(),
          weights: [
            { label: "Visual Minimalism", value: 50 },
            { label: "Brand Salience", value: 50 },
            { label: "Heritage & Craft", value: 50 },
            { label: "Newness Appetite", value: 50 },
          ],
          guardrails: [],
        },
      });
      await router.invalidate();
      const refreshed = await listPersonas();
      setPersonas(refreshed);
      setWeights(Object.fromEntries(refreshed.map((p) => [p.id, p.weights])));
      setGuardrails(Object.fromEntries(refreshed.map((p) => [p.id, p.guardrails])));
      setActiveId(id);
      setShowNewPersona(false);
      setNewPersonaName("");
      setNewPersonaDesc("");
      setCreateSubmitted(false);
      toast.success("Persona created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create persona");
    }
  };

  return (
    <AppShell title={canEdit ? "Persona Studio" : "Persona Library"}>
      <div className="flex h-full overflow-hidden">
        <aside className="w-72 border-r border-border bg-card overflow-y-auto p-6 shrink-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Personas · {personas.length}
          </p>
          <div className="space-y-1">
            {personas.map((p) => {
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-accent/60"
                  }`}
                >
                  <p className="font-serif italic text-base leading-tight">{p.name}</p>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mt-1">
                    {p.client_count} clients
                  </p>
                </button>
              );
            })}
          </div>
          {canCreate && (
            <button
              onClick={() => setShowNewPersona(true)}
              className="w-full mt-6 text-[10px] uppercase tracking-widest border border-dashed border-border py-3 hover:bg-accent/40 flex items-center justify-center gap-1"
            >
              <Plus className="size-3" /> New Persona
            </button>
          )}
        </aside>

        <section className="flex-1 overflow-y-auto p-10 animate-slide-up">
          {!active ? (
            <p className="text-muted-foreground italic">No personas yet.</p>
          ) : (
            <div className="max-w-3xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                {canEdit ? (
                  "Editing"
                ) : (
                  <>
                    <Lock className="size-3" strokeWidth={1.5} />
                    Read-only · Governed by Marketing
                  </>
                )}
              </p>
              <h2 className="font-serif text-4xl italic leading-tight">{active.name}</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                {active.description}
              </p>
              {!canEdit && (
                <div className="mt-6 p-4 border border-border bg-card/50 rounded-sm text-xs text-muted-foreground leading-relaxed">
                  Personas are centrally defined by the Marketing team. As a store associate, you
                  can review the persona definition and apply its recommendations during client
                  interactions. To request a change, contact{" "}
                  <span className="text-foreground">Client Strategy · HQ</span>.
                </div>
              )}

              <div className="mt-12 grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-semibold mb-6">
                    Recommendation Weights
                  </h3>
                  <div className="space-y-6">
                    {currentWeights.map((w) => (
                      <div key={w.label}>
                        <div className="flex justify-between text-[10px] font-mono mb-2 uppercase">
                          <span>{w.label}</span>
                          <span>{w.value}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={w.value}
                          disabled={!canEdit}
                          onChange={(e) => setWeight(w.label, Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-semibold mb-6">
                    Brand Voice Guardrails
                  </h3>
                  <ul className="space-y-3">
                    {currentGuardrails.map((g) => (
                      <li
                        key={g}
                        className="text-sm text-muted-foreground italic font-serif leading-relaxed pl-4 border-l-2 border-primary/40 flex items-start justify-between gap-2 group"
                      >
                        <span>{g}</span>
                        {canEdit && (
                          <button
                            onClick={() => removeGuardrail(g)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                          >
                            <X className="size-3" strokeWidth={2} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {canEdit && (
                    <div className="mt-4 flex gap-2">
                      <input
                        value={newGuardrail}
                        onChange={(e) => setNewGuardrail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGuardrail())}
                        placeholder="Add guardrail…"
                        className="flex-1 text-[10px] bg-transparent border border-dashed border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary rounded-sm placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={addGuardrail}
                        className="text-[10px] uppercase tracking-widest text-primary px-3"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-14 flex items-center justify-between pt-8 border-t border-border">
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {canEdit
                      ? `Changes recalibrate recommendations for ${active.client_count} clients`
                      : `Active for ${active.client_count} clients · Last published 12 May by Marketing`}
                  </p>
                  {canEdit && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-3" strokeWidth={1.5} /> Delete
                    </button>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleRevert}
                      disabled={saving}
                      className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm disabled:opacity-50"
                    >
                      Revert
                    </button>
                    <button
                      onClick={() => handleSave(false)}
                      disabled={saving}
                      className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save Draft"}
                    </button>
                    {canPublish && (
                      <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="text-[10px] uppercase tracking-widest px-5 py-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Publish & Recalibrate"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {confirmDelete && active && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full">
            <h3 className="font-serif text-xl italic mb-2">Delete "{active.name}"?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This persona will be permanently removed. Clients assigned to it will lose their
              persona association.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-[10px] uppercase tracking-widest px-5 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPersona && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-md w-full space-y-4">
            <h3 className="font-serif text-xl italic">New Persona</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                autoFocus
                value={newPersonaName}
                onChange={(e) => setNewPersonaName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className={`w-full bg-transparent border px-3 py-2 text-sm focus:outline-none focus:ring-1 rounded-sm ${
                  createSubmitted && !newPersonaName.trim()
                    ? "border-destructive focus:ring-destructive"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="e.g. Emerging Collector"
              />
              {createSubmitted && !newPersonaName.trim() && (
                <p className="text-xs text-destructive">Name is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                Description
              </label>
              <textarea
                value={newPersonaDesc}
                onChange={(e) => setNewPersonaDesc(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-sm resize-none"
                placeholder="Describe the persona's values and buying behaviour…"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewPersona(false)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="text-[10px] uppercase tracking-widest px-5 py-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors"
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
