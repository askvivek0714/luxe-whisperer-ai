import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { personas, type Persona } from "@/lib/clienteling-data";
import { useRole, can } from "@/lib/rbac";


export const Route = createFileRoute("/personas")({
  component: PersonaStudio,
  head: () => ({
    meta: [
      { title: "Persona Studio · Maison Vaurien" },
      {
        name: "description",
        content:
          "Tune persona weights and brand-voice guardrails for Claude-powered recommendations.",
      },
    ],
  }),
});

function PersonaStudio() {
  const { role } = useRole();
  const canEdit = can(role, "persona.edit");
  const canPublish = can(role, "persona.publish");

  const [activeId, setActiveId] = useState(personas[0].id);
  const active = personas.find((p) => p.id === activeId)!;
  const [weights, setWeights] = useState<Record<string, Persona["weights"]>>(
    Object.fromEntries(personas.map((p) => [p.id, p.weights])),
  );

  const setWeight = (label: string, value: number) => {
    if (!canEdit) return;
    setWeights((w) => ({
      ...w,
      [active.id]: w[active.id].map((x) => (x.label === label ? { ...x, value } : x)),
    }));
  };

  const current = weights[active.id];

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
                    {p.clientCount} clients
                  </p>
                </button>
              );
            })}
          </div>
          {canEdit && (
            <button className="w-full mt-6 text-[10px] uppercase tracking-widest border border-dashed border-border py-3 hover:bg-accent/40">
              + New Persona
            </button>
          )}

        </aside>

        <section className="flex-1 overflow-y-auto p-10 animate-slide-up">
          <div className="max-w-3xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              {canEdit ? "Editing" : (
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
                Personas are centrally defined by the Marketing team. As a store
                associate, you can review the persona definition and apply its
                recommendations during client interactions. To request a change,
                contact <span className="text-foreground">Client Strategy · HQ</span>.
              </div>
            )}


            <div className="mt-12 grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs uppercase tracking-widest font-semibold mb-6">
                  Recommendation Weights
                </h3>
                <div className="space-y-6">
                  {current.map((w) => (
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
                        onChange={(e) => setWeight(w.label, Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
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
                  {active.guardrails.map((g) => (
                    <li
                      key={g}
                      className="text-sm text-muted-foreground italic font-serif leading-relaxed pl-4 border-l-2 border-primary/40"
                    >
                      {g}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 text-[10px] uppercase tracking-widest text-primary">
                  + Add guardrail
                </button>
              </div>
            </div>

            <div className="mt-14 flex items-center justify-between pt-8 border-t border-border">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Changes recalibrate recommendations for {active.clientCount} clients
              </p>
              <div className="flex gap-3">
                <button className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm">
                  Revert
                </button>
                <button className="text-[10px] uppercase tracking-widest px-5 py-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors">
                  Save & Recalibrate
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
