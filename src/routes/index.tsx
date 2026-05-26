import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
// Link still used for "All Customers" footer link
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { listClients } from "@/lib/fns/clients";
import { Avatar } from "@/components/Avatar";
import { ArrowUpRight, Circle, ChevronDown } from "lucide-react";
import { useRole } from "@/lib/rbac";
import { ASSOCIATE_STORE } from "@/lib/stores";

export const Route = createFileRoute("/")({
  loader: () => listClients(),
  component: TodayPage,
  head: () => ({
    meta: [
      { title: "Today · ABL Clienteling" },
      {
        name: "description",
        content: "Today's expected guests, arrivals, and AI-prepared client briefs.",
      },
    ],
  }),
});

// ── Status helpers ────────────────────────────────────────────────────────────

type VisitStatus = "expected" | "in-store" | "completed";

const STATUS_CYCLE: VisitStatus[] = ["expected", "in-store", "completed"];
const STATUS_LABELS: Record<VisitStatus, string> = {
  expected: "Expected",
  "in-store": "In Store",
  completed: "Completed",
};
const STATUS_STYLES: Record<VisitStatus, string> = {
  expected: "border-border text-muted-foreground",
  "in-store": "border-primary/50 text-primary bg-primary/5",
  completed: "border-green-500/40 text-green-600 bg-green-500/5",
};
const DOT_STYLES: Record<VisitStatus, string> = {
  expected: "fill-muted-foreground/30 text-muted-foreground/30",
  "in-store": "fill-primary text-primary animate-pulse",
  completed: "fill-green-500 text-green-500",
};

const ROSTER_KEY = "today:roster-status";

function loadStatuses(): Record<string, VisitStatus> {
  try {
    return JSON.parse(localStorage.getItem(ROSTER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveStatuses(s: Record<string, VisitStatus>) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(s));
}

function StatusBadge({
  clientId,
  statuses,
  onChange,
}: {
  clientId: string;
  statuses: Record<string, VisitStatus>;
  onChange: (id: string, s: VisitStatus) => void;
}) {
  const current: VisitStatus = statuses[clientId] ?? "expected";
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onChange(clientId, next);
      }}
      title={`Click to mark as ${STATUS_LABELS[next]}`}
      className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border transition-colors ${STATUS_STYLES[current]}`}
    >
      <Circle className={`size-1.5 ${DOT_STYLES[current]}`} />
      {STATUS_LABELS[current]}
      <ChevronDown className="size-2.5 opacity-40" />
    </button>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

function TodayPage() {
  const allClients = Route.useLoaderData();
  const { role } = useRole();
  const navigate = useNavigate();
  const router = useRouter();

  // Redirect marketing/admin away from Today
  useEffect(() => {
    if (role === "marketing" || role === "admin") {
      navigate({ to: "/analytics" });
    }
  }, [role, navigate]);

  // Filter to associate's store only
  const clients = allClients.filter((c) => (c.store ?? ASSOCIATE_STORE) === ASSOCIATE_STORE);

  const [statuses, setStatuses] = useState<Record<string, VisitStatus>>(loadStatuses);

  function handleStatusChange(id: string, s: VisitStatus) {
    const updated = { ...statuses, [id]: s };
    setStatuses(updated);
    saveStatuses(updated);
  }

  const inStore = Object.values(statuses).filter((s) => s === "in-store").length +
    clients.filter((c) => !(c.id in statuses) && false).length;
  const completedCount = Object.values(statuses).filter((s) => s === "completed").length;

  const stats = [
    { label: "Expected today", value: String(clients.length) },
    { label: "In store", value: String(inStore) },
    { label: "Completed", value: String(completedCount) },
    { label: "AI briefs prepared", value: `${clients.length} / ${clients.length}` },
  ];

  if (role === "marketing" || role === "admin") return null;

  return (
    <AppShell title="In-Store Management">
      <div className="px-8 py-10 max-w-6xl mx-auto animate-slide-up">
        <div className="mb-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Monday · 25 May 2026 · {ASSOCIATE_STORE}
          </p>
          <h2 className="font-serif text-4xl leading-tight">
            Good afternoon, <span className="italic">Julian</span>.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-pretty">
            {clients.length > 0
              ? `${clients.length} guest${clients.length !== 1 ? "s" : ""} ${clients.length === 1 ? "is" : "are"} anticipated at the ${ASSOCIATE_STORE} today.`
              : "No guests scheduled today."}{" "}
            Each brief has been prepared with Claude-curated recommendations and brand-voice
            icebreakers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="p-5 bg-card border border-border rounded-sm">
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                {s.label}
              </p>
              <p className="font-serif text-3xl mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xs uppercase tracking-widest font-semibold">Today's Roster</h3>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Click status to update
          </p>
          <Link
            to="/clients"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            All Customers <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          {clients.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground italic">
              No customers scheduled. Add customers to see them here.
            </p>
          ) : (
            clients.map((c, i) => (
              <div
                key={c.id}
                onClick={() => router.navigate({ to: "/clients/$clientId", params: { clientId: c.id } })}
                className={`flex items-center gap-5 px-6 py-5 hover:bg-accent/40 transition-colors cursor-pointer ${
                  i !== clients.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0">
                  {c.appointment_time ?? "—"}
                </span>
                <Avatar name={c.name} className="size-12 rounded-full text-xs shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg italic leading-tight">{c.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-primary font-mono mt-0.5">
                    {c.persona}
                  </p>
                </div>
                <div className="hidden md:block text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Lifetime</p>
                  <p className="text-sm font-medium font-mono">{c.lifetime_value}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusBadge
                    clientId={c.id}
                    statuses={statuses}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
