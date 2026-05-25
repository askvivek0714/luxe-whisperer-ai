import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { clients, products, recommendationsByClient } from "@/lib/clienteling-data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
  head: () => ({
    meta: [
      { title: "Recommendations · Maison Vaurien" },
      {
        name: "description",
        content: "AI-curated product recommendations across active clients.",
      },
    ],
  }),
});

function RecommendationsPage() {
  const feed = clients.flatMap((c) =>
    (recommendationsByClient[c.id] ?? []).map((r) => ({ client: c, rec: r })),
  );

  return (
    <AppShell title="Recommendation Feed">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Claude Intelligence
            </p>
            <h2 className="font-serif text-4xl">Live Recommendation Feed</h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Ranked by affinity score and persona alignment. Reasoning is auditable and respects
              brand-voice guardrails configured in the Persona Studio.
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {feed.length} active
          </span>
        </div>

        <div className="space-y-3">
          {feed
            .sort((a, b) => b.rec.affinity - a.rec.affinity)
            .map(({ client, rec }) => {
              const p = products[rec.productId];
              if (!p) return null;
              return (
                <Link
                  key={`${client.id}-${rec.productId}`}
                  to="/clients/$clientId"
                  params={{ clientId: client.id }}
                  className="flex gap-5 bg-card border border-border rounded-sm p-5 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={p.image}
                    alt=""
                    className="size-20 object-cover rounded-sm ring-1 ring-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                          For {client.name} · {client.persona}
                        </p>
                        <h3 className="font-serif italic text-xl leading-tight mt-1">{p.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium">{p.price}</p>
                        <p className="text-[10px] font-mono text-primary mt-1">
                          {rec.affinity}% affinity
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      <Sparkles className="size-3 inline mr-1 text-primary" strokeWidth={1.5} />
                      {rec.reasoning}
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </AppShell>
  );
}
