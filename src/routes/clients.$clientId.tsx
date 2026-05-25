import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ClientForm } from "@/components/forms/ClientForm";
import { getClient, deleteClient } from "@/lib/fns/clients";
import { listRecommendationsForClient } from "@/lib/fns/recommendations";
import { listProducts } from "@/lib/fns/products";
import { listPersonas } from "@/lib/fns/personas";
import { resolvePortrait, resolveProductImage } from "@/lib/assets";
import { ArrowLeft, Send, Sparkles, ChevronRight, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/clients/$clientId")({
  component: ClientDetail,
  notFoundComponent: () => (
    <AppShell title="Customer not found">
      <div className="p-12 text-center text-muted-foreground">
        <p>That customer profile could not be located.</p>
        <Link to="/clients" className="text-primary mt-4 inline-block">
          ← Return to directory
        </Link>
      </div>
    </AppShell>
  ),
  loader: async ({ params }) => {
    const [client, products, personas] = await Promise.all([
      getClient({ data: { id: params.clientId } }),
      listProducts(),
      listPersonas(),
    ]);
    if (!client) throw notFound();
    const recs = await listRecommendationsForClient({ data: { clientId: client.id } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    return { client, recs, productMap, personas };
  },
});

function ClientDetail() {
  const { client, recs, productMap, personas } = Route.useLoaderData();
  const router = useRouter();
  const persona = personas.find((p) => p.id === client.persona_id);

  const [note, setNote] = useState(
    `Dear ${client.name.split(" ")[0]},\n\nIt was a pleasure welcoming you to the boutique. The pieces we discussed have been set aside under your name.\n\nWarmly,\nJulian`,
  );
  const [sent, setSent] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    await deleteClient({ data: { id: client.id } });
    router.navigate({ to: "/clients" });
  }

  return (
    <AppShell title="Customer 360">
      <div className="flex h-full overflow-hidden">
        <aside className="w-80 border-r border-border bg-card overflow-y-auto p-8 animate-pulse-in shrink-0">
          <Link
            to="/clients"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="size-3" /> Directory
          </Link>

          <div className="mb-8 text-center">
            <img
              src={resolvePortrait(client.portrait)}
              alt={client.name}
              className="size-28 rounded-full mx-auto mb-4 object-cover ring-1 ring-border"
            />
            <h2 className="font-serif text-2xl italic mb-1">{client.name}</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary font-mono">
              {client.persona}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">
              {client.tier}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setShowEdit(true)}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm"
              >
                <Pencil className="size-3" strokeWidth={1.5} /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-destructive hover:text-destructive/80 border border-destructive/30 px-3 py-1.5 rounded-sm"
              >
                <Trash2 className="size-3" strokeWidth={1.5} /> Delete
              </button>
            </div>
          </div>

          <div className="space-y-7">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-3">Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Lifetime" value={client.lifetime_value} />
                <Stat label="Last Visit" value={`${client.last_visit_days} days`} />
                <Stat label="Garment" value={client.garment_size} />
                <Stat label="Shoe" value={client.shoe_size} />
              </div>
            </div>

            {client.preferences.length > 0 && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-3">
                  Preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  {client.preferences.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 bg-accent text-[10px] font-medium rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {client.acquisitions.length > 0 && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-3">
                  Recent Acquisitions
                </p>
                <div className="space-y-3">
                  {client.acquisitions.map((a) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <img
                        src={resolveProductImage(a.image)}
                        alt=""
                        className="size-12 rounded-sm object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {a.season} · {a.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {persona && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-3">
                  Persona Brief
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {persona.description}
                </p>
                <Link
                  to="/personas"
                  className="text-[10px] uppercase tracking-widest text-primary mt-3 inline-flex items-center gap-1"
                >
                  Open in Studio <ChevronRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 bg-background p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-7 bg-foreground text-background rounded-full grid place-items-center">
                  <Sparkles className="size-3.5" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium">
                  Claude's Recommendations for {client.name.split(" ")[0]}
                </h3>
                <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {recs.length} recommendation{recs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {recs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No recommendations yet. Add one from the Recommendations page.
                </p>
              ) : (
                <div className="grid gap-4">
                  {recs.map((r) => {
                    const p = productMap[r.product_id];
                    if (!p) return null;
                    return (
                      <div
                        key={r.id}
                        className="bg-card p-6 rounded-sm border border-border flex gap-6 hover:shadow-xl transition-shadow"
                      >
                        <img
                          src={resolveProductImage(p.image)}
                          alt={p.name}
                          className="w-32 aspect-[2/3] object-cover rounded-sm ring-1 ring-border shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start mb-2 gap-3">
                              <h4 className="font-serif text-xl italic leading-tight">{p.name}</h4>
                              <span className="font-mono text-sm font-medium whitespace-nowrap">
                                {p.price}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground mb-3">
                              SKU {p.sku} · {p.category}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                              {r.reasoning}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {r.signals.map((s) => (
                                <span
                                  key={s}
                                  className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider"
                                >
                                  {s}
                                </span>
                              ))}
                              <span className="text-[9px] font-mono bg-accent px-2 py-0.5 rounded uppercase tracking-wider">
                                {p.floor_stock + p.vault_stock} in stock
                              </span>
                            </div>
                          </div>
                          {r.icebreaker && (
                            <div className="p-3 bg-secondary/60 rounded-sm border border-border">
                              <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">
                                Icebreaker
                              </p>
                              <p className="text-xs italic font-serif leading-relaxed">
                                "{r.icebreaker}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-border animate-slide-up">
              <h3 className="text-xs uppercase tracking-widest font-semibold mb-2">
                Post-Visit Follow-up
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-mono mb-5">
                Drafted by Claude · brand voice locked to {client.persona}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-40 bg-card border border-border p-5 text-sm font-serif italic leading-relaxed rounded-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] font-mono text-muted-foreground">
                  Channel: Encrypted concierge SMS · Send window T+24h
                </p>
                <button
                  onClick={() => setSent(true)}
                  disabled={sent}
                  className="inline-flex items-center gap-2 bg-foreground text-background text-[10px] uppercase tracking-widest font-semibold px-5 py-3 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
                >
                  <Send className="size-3" strokeWidth={1.8} />
                  {sent ? "Queued for delivery" : "Send via Concierge"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showEdit && (
        <ClientForm open={showEdit} onClose={() => setShowEdit(false)} client={client} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full">
            <h3 className="font-serif text-xl italic mb-2">Delete {client.name}?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the client profile and all associated recommendations.
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
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border border-border rounded-sm">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-sm font-mono">{value}</p>
    </div>
  );
}
