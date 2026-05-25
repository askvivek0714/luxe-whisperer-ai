import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ClientForm } from "@/components/forms/ClientForm";
import { listClients } from "@/lib/fns/clients";
import { resolvePortrait } from "@/lib/assets";
import { useRole, can } from "@/lib/rbac";

export const Route = createFileRoute("/clients")({
  loader: () => listClients(),
  component: ClientsLayout,
  head: () => ({
    meta: [
      { title: "Clients · Maison Vaurien" },
      {
        name: "description",
        content: "Full directory of boutique clients with persona and tier signals.",
      },
    ],
  }),
});

function ClientsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/clients";
  if (isDetail) return <Outlet />;

  const clients = Route.useLoaderData();
  const { role } = useRole();
  const canCreate = can(role, "client.view");
  const [showForm, setShowForm] = useState(false);

  return (
    <AppShell title="Clients">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Directory
            </p>
            <h2 className="font-serif text-4xl">All Clients</h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              {clients.length} VIC and Private Client profiles, indexed by persona cluster and
              lifetime value.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-foreground text-background text-[10px] uppercase tracking-widest font-semibold px-5 py-3 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="size-3" strokeWidth={2} />
              New Client
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {clients.map((c) => (
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showForm && <ClientForm open={showForm} onClose={() => setShowForm(false)} />}
    </AppShell>
  );
}
