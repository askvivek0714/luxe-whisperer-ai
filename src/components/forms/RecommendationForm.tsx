import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRecommendation, type RecommendationRow } from "@/lib/fns/recommendations";
import type { ClientRow } from "@/lib/fns/clients";
import type { ProductRow } from "@/lib/fns/products";

type Props = {
  open: boolean;
  onClose: () => void;
  clients: ClientRow[];
  products: ProductRow[];
  defaultClientId?: string;
};

export function RecommendationForm({ open, onClose, clients, products, defaultClientId }: Props) {
  const router = useRouter();

  const [clientId, setClientId] = useState(defaultClientId ?? clients[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [affinity, setAffinity] = useState("75");
  const [reasoning, setReasoning] = useState("");
  const [icebreaker, setIcebreaker] = useState("");
  const [signalsRaw, setSignalsRaw] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const signals = signalsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await createRecommendation({
        data: {
          client_id: clientId,
          product_id: productId,
          affinity: parseInt(affinity) || 75,
          reasoning,
          icebreaker,
          signals,
        },
      });
      await router.invalidate();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl">New Recommendation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Product</Label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Affinity Score (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={affinity}
                onChange={(e) => setAffinity(e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Reasoning</Label>
              <Textarea
                rows={2}
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why is this product right for this client?"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Icebreaker</Label>
              <Textarea
                rows={2}
                value={icebreaker}
                onChange={(e) => setIcebreaker(e.target.value)}
                placeholder="Opening line for the client conversation…"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Signals (comma-separated)</Label>
              <Input
                placeholder="High Affinity, Persona match 90%"
                value={signalsRaw}
                onChange={(e) => setSignalsRaw(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !clientId || !productId}>
              {saving ? "Saving…" : "Create Recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
