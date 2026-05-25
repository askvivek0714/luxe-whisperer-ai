import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RecommendationForm } from "@/components/forms/RecommendationForm";
import { listRecommendations, deleteRecommendation } from "@/lib/fns/recommendations";
import { listClients } from "@/lib/fns/clients";
import { listProducts } from "@/lib/fns/products";
import { resolveProductImage } from "@/lib/assets";
import { Sparkles } from "lucide-react";
import { useRole, can } from "@/lib/rbac";

export const Route = createFileRoute("/recommendations")({
  loader: async () => {
    const [recs, clients, products] = await Promise.all([
      listRecommendations(),
      listClients(),
      listProducts(),
    ]);
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    return { recs, clientMap, productMap, clients, products };
  },
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
  const { recs, clientMap, productMap, clients, products } = Route.useLoaderData();
  const router = useRouter();
  const { role } = useRole();
  const canCreate = can(role, "recommendation.view");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    await deleteRecommendation({ data: { id } });
    await router.invalidate();
  }

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
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {recs.length} active
            </span>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-foreground text-background text-[10px] uppercase tracking-widest font-semibold px-5 py-3 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="size-3" strokeWidth={2} />
                New
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {recs.map(({ id, client_id, product_id, affinity, reasoning }) => {
            const client = clientMap[client_id];
            const p = productMap[product_id];
            if (!client || !p) return null;
            return (
              <div
                key={id}
                className="flex gap-5 bg-card border border-border rounded-sm p-5 hover:shadow-lg transition-shadow group"
              >
                <Link
                  to="/clients/$clientId"
                  params={{ clientId: client.id }}
                  className="flex gap-5 flex-1 min-w-0"
                >
                  <img
                    src={resolveProductImage(p.image)}
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
                          {affinity}% affinity
                        </p>
                      </div>
                    </div>
                    {reasoning && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        <Sparkles className="size-3 inline mr-1 text-primary" strokeWidth={1.5} />
                        {reasoning}
                      </p>
                    )}
                  </div>
                </Link>
                {canCreate && (
                  <button
                    onClick={() => setDeletingId(id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 self-center"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            );
          })}

          {recs.length === 0 && (
            <p className="text-center text-muted-foreground italic py-16">
              No recommendations yet. Create one to get started.
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
            <h3 className="font-serif text-xl italic mb-2">Delete recommendation?</h3>
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
