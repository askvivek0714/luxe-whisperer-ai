import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Users, Sparkles, SlidersHorizontal, BarChart3 } from "lucide-react";
import { ArrivalAlert } from "./ArrivalAlert";

const navItems = [
  { to: "/", label: "Today", icon: CalendarClock },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/personas", label: "Personas", icon: SlidersHorizontal },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <nav className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-6 mb-4">
          <div className="text-[10px] tracking-[0.3em] font-semibold uppercase opacity-40">
            Maison Vaurien
          </div>
          <div className="font-serif italic text-lg mt-1">Clienteling</div>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-4 opacity-70" strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-foreground text-background grid place-items-center text-[10px] font-mono">
              JS
            </div>
            <div>
              <p className="text-xs font-semibold">Julian Soames</p>
              <p className="text-[10px] text-muted-foreground">Senior Associate · Bond St.</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-8 flex items-center justify-between shrink-0">
          <h1 className="font-serif italic text-xl">{title}</h1>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
            Bond St. Flagship · 14:02 GMT
          </div>
        </header>
        <ArrivalAlert />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
