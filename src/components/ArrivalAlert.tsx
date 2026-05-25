import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { clients } from "@/lib/clienteling-data";

export function ArrivalAlert() {
  const [visible, setVisible] = useState(false);
  const client = clients.find((c) => c.status === "arrived");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!client || !visible) return null;

  return (
    <div className="absolute top-6 right-6 z-50 animate-slide-in-right">
      <Link to="/clients/$clientId" params={{ clientId: client.id }} className="block group">
        <div className="bg-foreground text-background p-5 rounded shadow-2xl ring-1 ring-white/10 flex items-center gap-5 min-w-[340px] hover:brightness-110 transition">
          <img
            src={client.portrait}
            alt=""
            className="size-12 rounded-full object-cover ring-1 ring-white/20"
          />
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
              Arrival Detected
            </p>
            <p className="font-serif italic text-lg leading-none">{client.name}</p>
            <p className="text-[10px] text-primary mt-1 uppercase tracking-wider font-mono">
              {client.persona}
            </p>
          </div>
          <div className="pl-4 border-l border-white/10 text-right">
            <span className="text-[10px] font-mono opacity-60">{client.tier}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setVisible(false);
              }}
              className="block mt-2 opacity-40 hover:opacity-100 ml-auto"
              aria-label="Dismiss"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
