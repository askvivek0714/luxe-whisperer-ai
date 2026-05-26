import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RecommendationForm } from "@/components/forms/RecommendationForm";
import { listRecommendations, deleteRecommendation } from "@/lib/fns/recommendations";
import { listClients } from "@/lib/fns/clients";
import { listProducts } from "@/lib/fns/products";
import { resolveProductImage } from "@/lib/assets";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/recommendations")({
  loader: () => {
    const recs = listRecommendations();
    const clients = listClients();
    const products = listProducts();
    return Promise.all([recs, clients, products]).then(([r, c, p]) => ({
      recs: r,
      clientMap: Object.fromEntries(c.map((x) => [x.id, x])),
      productMap: Object.fromEntries(p.map((x) => [x.id, x])),
      clients: c,
      products: p,
    }));
  },
  component: RecommendationsPage,
  head: () => ({
    meta: [
      { title: "AI Briefings · ABL Clienteling" },
      {
        name: "description",
        content: "AI-curated product briefings prepared for today's expected customers.",
      },
    ],
  }),
});

function RecommendationsPage() {
  const { recs, clientMap, productMap, clients, products } = Route.useLoaderData();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    await deleteRecommendation({ data: { id } });
    await router.invalidate();
  }

  // Group recommendations by client for a briefing-style layout
  const byClient = clients
    .map((c) => ({
      client: c,
      recs: recs.filter((r) => r.client_id === c.id),
    }))
    .filter((g) => g.recs.length > 0);

  return (
    <AppShell title="AI Briefings">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Claude Intelligence · Prepared today
            </p>
            <h2 className="font-serif text-4xl">AI Briefings</h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Curated product recommendations prepared for each customer, ranked by affinity and
              persona alignment.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {recs.length} recommendation{recs.length !== 1 ? "s" : ""} across {byClient.length} customer{byClient.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grouped by customer */}
        <div className="space-y-10">
          {byClient.map(({ client, recs: clientRecs }) => (
            <div key={client.id}>
              {/* Customer header */}
              <Link
                to="/clients/$clientId"
                params={{ clientId: client.id }}
                className="flex items-center gap-4 mb-4 group"
              >
                <Avatar name={client.name} className="size-10 rounded-full text-[10px]" />
                <div>
                  <p className="font-serif italic text-lg leading-none group-hover:text-primary transition-colors">
                    {client.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-0.5">
                    {client.persona} · {client.tier}
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {clientRecs.length} brief{clientRecs.length !== 1 ? "s" : ""}
                </span>
              </Link>

              {/* Recommendation cards for this customer */}
              <div className="space-y-2 pl-14">
                {clientRecs.map(({ id, product_id, affinity, reasoning, signals }) => {
                  const p = productMap[product_id];
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      className="flex gap-4 bg-card border border-border rounded-sm p-4 hover:shadow-md transition-shadow group"
                    >
                      <img
                        src={resolveProductImage(p.image)}
                        alt=""
                        className="size-14 object-cover rounded-sm ring-1 ring-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h3 className="font-serif italic text-base leading-tight">{p.name}</h3>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                              SKU {p.sku}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-sm font-medium">{p.price}</p>
                            <p className="text-[10px] font-mono text-primary">{affinity}% affinity</p>
                          </div>
                        </div>
                        {reasoning && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                            <Sparkles className="size-3 inline mr-1 text-primary" strokeWidth={1.5} />
                            {reasoning}
                          </p>
                        )}
                        {signals.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {signals.map((s) => (
                              <span
                                key={s}
                                className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setDeletingId(id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 self-center"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {recs.length === 0 && (
            <p className="text-center text-muted-foreground italic py-16">
              No briefings prepared yet. Add a recommendation to get started.
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <RecommendationForm
          open={showForm}
          onClose={() => setShowForm(false)}
          clients={clients}
          products={products}
        />
      )}

      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full">
            <h3 className="font-serif text-xl italic mb-2">Remove briefing?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This recommendation will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(deletingId);
                  setDeletingId(null);
                }}
                className="text-[10px] uppercase tracking-widest px-5 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
