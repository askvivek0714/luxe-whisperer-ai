import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listClients } from "@/lib/fns/clients";
import { resolvePortrait } from "@/lib/assets";
import { useRole } from "@/lib/rbac";
import { STORES, ASSOCIATE_STORE } from "@/lib/stores";

export const Route = createFileRoute("/clients")({
  loader: () => listClients(),
  component: ClientsLayout,
  head: () => ({
    meta: [
      { title: "Customers · Maison Vaurien" },
      {
        name: "description",
        content: "Full directory of boutique customers with persona and tier signals.",
      },
    ],
  }),
});

function ClientsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/clients";
  if (isDetail) return <Outlet />;

  const allClients = Route.useLoaderData();
  const { role } = useRole();
  const isAssociate = role === "associate";

  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");

  // Associates always see only their store; marketing/admin can filter
  const storeFiltered = isAssociate
    ? allClients.filter((c) => (c.store ?? ASSOCIATE_STORE) === ASSOCIATE_STORE)
    : selectedStore === "all"
      ? allClients
      : allClients.filter((c) => (c.store ?? ASSOCIATE_STORE) === selectedStore);

  const filtered = search.trim()
    ? storeFiltered.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.persona?.toLowerCase().includes(search.toLowerCase()) ||
          c.tier?.toLowerCase().includes(search.toLowerCase()),
      )
    : storeFiltered;

  const isNewCustomer = search.trim().length > 0 && filtered.length === 0;

  // Store counts for tabs (marketing/admin only)
  const storeCounts = STORES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = allClients.filter((c) => (c.store ?? ASSOCIATE_STORE) === s).length;
    return acc;
  }, {});

  const totalCount = isAssociate
    ? storeFiltered.length
    : selectedStore === "all"
      ? allClients.length
      : storeCounts[selectedStore] ?? 0;

  return (
    <AppShell title="Customers">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <div className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                {isAssociate ? ASSOCIATE_STORE : "All Stores"} · Directory
              </p>
              <h2 className="font-serif text-4xl">All Customers</h2>
              <p className="text-muted-foreground mt-3 max-w-xl">
                {totalCount} VIC and Private Client profiles, indexed by persona cluster and
                lifetime value.
              </p>
            </div>
          </div>

          {/* Store tabs — marketing/admin only */}
          {!isAssociate && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setSelectedStore("all")}
                className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-colors ${
                  selectedStore === "all"
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({allClients.length})
              </button>
              {STORES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStore(s)}
                  className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-colors ${
                    selectedStore === s
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s} ({storeCounts[s] ?? 0})
                </button>
              ))}
            </div>
          )}

          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, persona or tier…"
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {isNewCustomer ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="size-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl italic mb-2">No customer found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              "{search}" is not in the database. The AI recommendation engine only works with
              existing customers — please add them via the admin panel first.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to="/clients/$clientId"
                params={{ clientId: c.id }}
                className="bg-card border border-border rounded-sm p-6 hover:shadow-lg transition-shadow flex gap-5"
              >
                <img
                  src={resolvePortrait(c.portrait)}
                  alt=""
                  className="size-16 rounded-sm object-cover ring-1 ring-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif italic text-xl leading-tight">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-mono mt-1">
                    {c.persona}
                  </p>
                  <div className="flex gap-4 mt-4 text-[10px] font-mono text-muted-foreground">
                    <span>{c.tier}</span>
                    <span>·</span>
                    <span>{c.lifetime_value}</span>
                    {!isAssociate && (
                      <>
                        <span>·</span>
                        <span className="text-foreground/60">{c.store ?? ASSOCIATE_STORE}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
