import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { getClient } from "@/lib/fns/clients";
import { listRecommendationsForClient } from "@/lib/fns/recommendations";
import { listProducts } from "@/lib/fns/products";
import { listPersonas } from "@/lib/fns/personas";
import { resolveProductImage } from "@/lib/assets";
import { ArrowLeft, Send, Sparkles, ChevronRight, ChevronDown, Circle, Mic, Square } from "lucide-react";
import { toast } from "sonner";

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

// ── Visit status helpers (shared with Today page) ────────────────────────────

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
  try { return JSON.parse(localStorage.getItem(ROSTER_KEY) ?? "{}"); } catch { return {}; }
}

// ── Visit notes helpers ───────────────────────────────────────────────────────

function loadNoteText(clientId: string): string {
  try { return JSON.parse(localStorage.getItem(`visit-notes:${clientId}`) ?? "{}").text ?? ""; } catch { return ""; }
}
function saveNoteText(clientId: string, text: string) {
  localStorage.setItem(`visit-notes:${clientId}`, JSON.stringify({ text }));
}

// ── Page component ────────────────────────────────────────────────────────────

function ClientDetail() {
  const { client, recs, productMap, personas } = Route.useLoaderData();
  const router = useRouter();
  const persona = personas.find((p) => p.id === client.persona_id);

  // Visit status (synced with Today roster)
  const [statuses, setStatuses] = useState<Record<string, VisitStatus>>(loadStatuses);
  const clientStatus: VisitStatus = statuses[client.id] ?? "expected";

  function handleStatusChange() {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(clientStatus) + 1) % STATUS_CYCLE.length];
    const updated = { ...statuses, [client.id]: next };
    setStatuses(updated);
    localStorage.setItem(ROSTER_KEY, JSON.stringify(updated));
  }

  // Visit notes (shown when completed)
  const [noteText, setNoteText] = useState(() => loadNoteText(client.id));
  function handleNoteChange(text: string) {
    setNoteText(text);
    saveNoteText(client.id, text);
  }

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  const [note, setNote] = useState(
    `Dear ${client.name.split(" ")[0]},\n\nIt was a pleasure welcoming you to the boutique. The pieces we discussed have been set aside under your name.\n\nWarmly,\nJulian`,
  );
  const [sent, setSent] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

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
            <Avatar name={client.name} className="size-28 rounded-full mx-auto mb-4 text-2xl" />
            <h2 className="font-serif text-2xl italic mb-1">{client.name}</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary font-mono">
              {client.persona}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">
              {client.tier}
            </p>

            {/* Visit status badge */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleStatusChange}
                title={`Click to advance status`}
                className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${STATUS_STYLES[clientStatus]}`}
              >
                <Circle className={`size-1.5 ${DOT_STYLES[clientStatus]}`} />
                {STATUS_LABELS[clientStatus]}
                <ChevronDown className="size-2.5 opacity-40" />
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
                  search={{ highlight: persona.id }}
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

            {/* Completed-visit notes — voice + text */}
            {clientStatus === "completed" && (
              <div className="pt-10 border-t border-border animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-7 bg-green-500/10 text-green-600 rounded-full grid place-items-center">
                    <Circle className="size-3 fill-green-500 text-green-500" />
                  </div>
                  <h3 className="text-sm font-medium">Visit Notes</h3>
                  <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-green-600">
                    Completed
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-mono mb-5">
                  Record a voice note or add written observations for this visit
                </p>

                {/* Voice recording */}
                <div className="mb-5 p-4 bg-card border border-border rounded-sm">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                    Voice Note
                    {audioUrl && <span className="ml-2 text-green-600">· Recorded</span>}
                    {!audioUrl && <span className="ml-2 opacity-60">· Not persisted across sessions</span>}
                  </p>
                  <div className="flex items-center gap-3">
                    {!recording ? (
                      <button
                        onClick={startRecording}
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold px-4 py-2.5 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors"
                      >
                        <Mic className="size-3.5" strokeWidth={1.8} />
                        {audioUrl ? "Re-record" : "Start Recording"}
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-sm transition-colors animate-pulse"
                      >
                        <Square className="size-3.5" strokeWidth={1.8} />
                        Stop Recording
                      </button>
                    )}
                    {audioUrl && !recording && (
                      <audio src={audioUrl} controls className="h-8 flex-1" />
                    )}
                  </div>
                </div>

                {/* Text notes */}
                <textarea
                  value={noteText}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Add experience notes, customer observations, follow-up actions, items discussed…"
                  className="w-full h-32 bg-card border border-border p-4 text-sm leading-relaxed rounded-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
                />
                {noteText && (
                  <p className="text-[9px] font-mono text-muted-foreground mt-1.5">
                    Saved automatically
                  </p>
                )}
              </div>
            )}

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
                  onClick={() => !sent && setShowSendConfirm(true)}
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

      {showSendConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full">
            <h3 className="font-serif text-xl italic mb-2">
              Send follow-up to {client.name.split(" ")[0]}?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This message will be queued via the concierge channel and delivered within 24 hours.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSendConfirm(false)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSent(true);
                  setShowSendConfirm(false);
                  toast.success(`Message queued for ${client.name.split(" ")[0]} · T+24h`);
                }}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest px-5 py-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors"
              >
                <Send className="size-3" strokeWidth={1.8} />
                Confirm Send
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
