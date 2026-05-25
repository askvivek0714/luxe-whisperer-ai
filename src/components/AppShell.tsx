import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  Users,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  ShoppingBag,
  Lock,
  ChevronDown,
} from "lucide-react";
import { ArrivalAlert } from "./ArrivalAlert";
import { useRole, roleProfiles, can, type Permission, type Role } from "@/lib/rbac";
import { useState } from "react";

const navItems: {
  to: string;
  label: string;
  icon: typeof CalendarClock;
  required: Permission;
}[] = [
  { to: "/", label: "Today", icon: CalendarClock, required: "today.view" },
  { to: "/clients", label: "Customers", icon: Users, required: "client.view" },
  {
    to: "/recommendations",
    label: "Recommendations",
    icon: Sparkles,
    required: "recommendation.view",
  },
  {
    to: "/personas",
    label: "Personas",
    icon: SlidersHorizontal,
    required: "persona.view",
  },
  {
    to: "/products",
    label: "Products",
    icon: ShoppingBag,
    required: "persona.view",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    required: "analytics.view",
  },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole } = useRole();
  const profile = roleProfiles[role];
  const [open, setOpen] = useState(false);

  const visibleNav = navItems.filter((item) => {
    // Personas: visible to all who can view; only marketing/admin can edit.
    return can(role, item.required);
  });

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
          {visibleNav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            const readOnly =
              item.to === "/personas" && !can(role, "persona.edit");
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
                {readOnly && (
                  <Lock className="size-3 ml-auto opacity-50" strokeWidth={1.5} />
                )}
                {active && !readOnly && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center gap-3 p-2 rounded-sm hover:bg-accent/60 transition-colors text-left"
          >
            <div className="size-9 rounded-full bg-foreground text-background grid place-items-center text-[10px] font-mono">
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {profile.title}
              </p>
            </div>
            <ChevronDown className="size-3 opacity-50" />
          </button>
          {open && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-sm shadow-xl overflow-hidden">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-2">
                Switch role (demo)
              </p>
              {(["associate", "marketing", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-accent/60 ${
                    r === role ? "bg-primary/10" : ""
                  }`}
                >
                  <p className="font-medium capitalize">{r}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {roleProfiles[r].title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-8 flex items-center justify-between shrink-0">
          <h1 className="font-serif italic text-xl">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 border border-border rounded-sm">
              {role}
            </span>
            {role === "associate" && (
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                Bond St. Flagship · 14:02 GMT
              </div>
            )}
          </div>
        </header>
        <ArrivalAlert />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
