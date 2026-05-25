import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { clients } from "@/lib/clienteling-data";
import { ArrowUpRight, Circle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: TodayPage,
  head: () => ({
    meta: [
      { title: "Today · Maison Vaurien Clienteling" },
      {
        name: "description",
        content: "Today's expected guests, arrivals, and AI-prepared client briefs.",
      },
    ],
  }),
});

const stats = [
  { label: "Expected today", value: "14" },
  { label: "Arrived", value: "1" },
  { label: "Avg. basket forecast", value: "£4,820" },
  { label: "AI briefs prepared", value: "14 / 14" },
];

function TodayPage() {
  return (
    <AppShell title="In-Store Management">
      <div className="px-8 py-10 max-w-6xl mx-auto animate-slide-up">
        <div className="mb-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Monday · 25 May 2026
          </p>
          <h2 className="font-serif text-4xl leading-tight">
            Good afternoon, <span className="italic">Julian</span>.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-pretty">
            Fourteen guests are anticipated at the Bond Street flagship today. Each brief has been
            prepared with Claude-curated recommendations and brand-voice icebreakers.
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
          <Link
            to="/clients"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            All Clients <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          {clients.map((c, i) => (
            <Link
              key={c.id}
              to="/clients/$clientId"
              params={{ clientId: c.id }}
              className={`flex items-center gap-5 px-6 py-5 hover:bg-accent/40 transition-colors ${
                i !== clients.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[10px] font-mono text-muted-foreground w-12">
                {c.appointmentTime}
              </span>
              <img
                src={c.portrait}
                alt=""
                className="size-12 rounded-full object-cover ring-1 ring-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg italic leading-tight">{c.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-primary font-mono mt-0.5">
                  {c.persona}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs text-muted-foreground">Lifetime</p>
                <p className="text-sm font-medium font-mono">{c.lifetimeValue}</p>
              </div>
              <span
                className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${
                  c.status === "arrived"
                    ? "border-primary/50 text-primary bg-primary/5"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Circle
                  className={`size-1.5 ${
                    c.status === "arrived"
                      ? "fill-primary text-primary animate-pulse"
                      : "fill-muted-foreground/30 text-muted-foreground/30"
                  }`}
                />
                {c.status === "arrived" ? "In Boutique" : "Expected"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
