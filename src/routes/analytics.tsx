import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analytics · Maison Vaurien" },
      {
        name: "description",
        content: "Conversion, attach rate, and persona performance analytics.",
      },
    ],
  }),
});

const kpis = [
  { label: "Attach rate uplift", value: "+18%", note: "vs. control cohort" },
  { label: "Conversion (assisted)", value: "62%", note: "+9 pts QoQ" },
  { label: "Avg. basket", value: "£4,820", note: "+£640 vs. Q1" },
  { label: "Persona match precision", value: "94%", note: "across 1,247 sessions" },
];

const personaPerformance = [
  { name: "Quiet Luxury Connoisseur", conversion: 71, basket: "£5,200" },
  { name: "Heritage Bespoke", conversion: 58, basket: "£6,800" },
  { name: "Editorial Modernist", conversion: 64, basket: "£3,950" },
];

function AnalyticsPage() {
  return (
    <AppShell title="Analytics">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Last 30 days · Bond Street flagship
        </p>
        <h2 className="font-serif text-4xl">Performance</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {kpis.map((k) => (
            <div key={k.label} className="p-5 bg-card border border-border rounded-sm">
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                {k.label}
              </p>
              <p className="font-serif text-3xl mt-2">{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{k.note}</p>
            </div>
          ))}
        </div>

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
