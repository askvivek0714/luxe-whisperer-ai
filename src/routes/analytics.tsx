import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { listClients } from "@/lib/fns/clients";

export const Route = createFileRoute("/analytics")({
  loader: () => listClients(),
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analytics · ABL Clienteling" },
      {
        name: "description",
        content: "Conversion, attach rate, and persona performance analytics.",
      },
    ],
  }),
});

// ── Static analytics data ────────────────────────────────────────────────────

const overallKpis = [
  { label: "Attach rate uplift", value: "+18%", note: "vs. control cohort" },
  { label: "Conversion (assisted)", value: "62%", note: "+9 pts QoQ" },
  { label: "Avg. basket", value: "£5,270", note: "+£890 vs. Q1" },
  { label: "Persona match precision", value: "94%", note: "across 4,247 sessions" },
];

const storeData = [
  {
    store: "Bond St. Flagship",
    revenue: "£226,540",
    conversion: 62,
    basket: "£4,820",
    sessions: 47,
    attachRate: "+18%",
    topPersona: "Quiet Luxury Connoisseur",
  },
  {
    store: "Mayfair",
    revenue: "£122,450",
    conversion: 58,
    basket: "£3,950",
    sessions: 31,
    attachRate: "+12%",
    topPersona: "Heritage Bespoke",
  },
  {
    store: "Paris Faubourg",
    revenue: "£390,600",
    conversion: 71,
    basket: "£6,200",
    sessions: 63,
    attachRate: "+24%",
    topPersona: "Editorial Modernist",
  },
  {
    store: "New York Fifth Ave",
    revenue: "£193,800",
    conversion: 65,
    basket: "£5,100",
    sessions: 38,
    attachRate: "+15%",
    topPersona: "Quiet Luxury Connoisseur",
  },
];

const personaPerformance = [
  { name: "Quiet Luxury Connoisseur", conversion: 71, basket: "£5,200" },
  { name: "Heritage Bespoke", conversion: 58, basket: "£6,800" },
  { name: "Editorial Modernist", conversion: 64, basket: "£3,950" },
];

function AnalyticsPage() {
  const clients = Route.useLoaderData();

  // Live customer counts per store from localStorage data
  const storeCounts = storeData.map((s) => ({
    ...s,
    customers: clients.filter((c) => (c.store ?? "Bond St. Flagship") === s.store).length,
  }));

  const totalRevenue = "£933,390";
  const totalSessions = storeData.reduce((a, s) => a + s.sessions, 0);

  return (
    <AppShell title="Analytics">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        {/* Header */}
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Last 30 days · All Stores
        </p>
        <h2 className="font-serif text-4xl">Performance Overview</h2>

        {/* Overall KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {overallKpis.map((k) => (
            <div key={k.label} className="p-5 bg-card border border-border rounded-sm">
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                {k.label}
              </p>
              <p className="font-serif text-3xl mt-2">{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{k.note}</p>
            </div>
          ))}
        </div>

        {/* Revenue summary pills */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-sm text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Total Revenue</p>
            <p className="font-serif text-2xl mt-1">{totalRevenue}</p>
          </div>
          <div className="px-4 py-2 bg-card border border-border rounded-sm text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Total Sessions</p>
            <p className="font-serif text-2xl mt-1">{totalSessions}</p>
          </div>
          <div className="px-4 py-2 bg-card border border-border rounded-sm text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Active Stores</p>
            <p className="font-serif text-2xl mt-1">{storeData.length}</p>
          </div>
          <div className="px-4 py-2 bg-card border border-border rounded-sm text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Total Customers</p>
            <p className="font-serif text-2xl mt-1">{clients.length}</p>
          </div>
        </div>

        {/* Store-wise performance */}
        <div className="mt-12">
          <h3 className="text-xs uppercase tracking-widest font-semibold mb-6">
            Store Performance
          </h3>
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-muted/30 border-b border-border">
              {["Store", "Revenue", "Conversion", "Avg. Basket", "Sessions", "Attach Rate", "Top Persona"].map((h) => (
                <p key={h} className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>
            {storeCounts.map((s, i) => (
              <div
                key={s.store}
                className={`grid grid-cols-7 gap-4 px-5 py-5 items-center ${
                  i !== storeCounts.length - 1 ? "border-b border-border" : ""
                } hover:bg-accent/30 transition-colors`}
              >
                <div>
                  <p className="font-serif italic text-base leading-tight">{s.store}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {s.customers} customer{s.customers !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="font-mono text-sm font-medium">{s.revenue}</p>
                <div>
                  <p className="font-mono text-sm">{s.conversion}%</p>
                  <div className="h-px w-full bg-border relative mt-1.5">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary h-0.5 -top-px"
                      style={{ width: `${s.conversion}%` }}
                    />
                  </div>
                </div>
                <p className="font-mono text-sm">{s.basket}</p>
                <p className="font-mono text-sm">{s.sessions}</p>
                <p className="text-sm text-green-600 font-mono font-medium">{s.attachRate}</p>
                <p className="text-xs text-muted-foreground italic font-serif leading-snug">
                  {s.topPersona}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Persona performance */}
        <div className="mt-12">
          <h3 className="text-xs uppercase tracking-widest font-semibold mb-6">
            Persona Performance
          </h3>
          <div className="bg-card border border-border rounded-sm divide-y divide-border">
            {personaPerformance.map((p) => (
              <div key={p.name} className="p-5 flex items-center gap-6">
                <div className="flex-1 min-w-0">
                  <p className="font-serif italic text-lg">{p.name}</p>
                  <div className="h-px w-full bg-border relative mt-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary h-0.5 -top-px"
                      style={{ width: `${p.conversion}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm">{p.conversion}%</p>
                  <p className="text-[10px] text-muted-foreground">{p.basket} avg.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
