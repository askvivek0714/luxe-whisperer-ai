import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient, updateClient, type ClientRow } from "@/lib/fns/clients";
import { useRole } from "@/lib/rbac";
import { STORES, ASSOCIATE_STORE } from "@/lib/stores";
import { store, ensureSeeded } from "@/lib/storage";

type Props = {
  open: boolean;
  onClose: () => void;
  client?: ClientRow;
  personas?: { id: string; name: string }[];
};

const TIERS = ["VIC · Tier I", "VIC · Tier II", "Private Client", "Client"];
const STATUSES: ClientRow["status"][] = ["arrived", "expected", "browsing"];

export function ClientForm({ open, onClose, client, personas: personasProp }: Props) {
  const router = useRouter();
  const { role } = useRole();
  const isEdit = !!client;
  const isAssociate = role === "associate";

  // Load personas synchronously from storage (fallback if not passed as prop)
  ensureSeeded();
  const personas = personasProp ?? store.personas.list();

  const [name, setName] = useState(client?.name ?? "");
  const [tier, setTier] = useState(client?.tier ?? TIERS[1]);
  const [clientStore, setClientStore] = useState(client?.store ?? ASSOCIATE_STORE);
  const [lifetimeValue, setLifetimeValue] = useState(client?.lifetime_value ?? "");
  const [persona, setPersona] = useState(client?.persona ?? "");
  const [status, setStatus] = useState<ClientRow["status"]>(client?.status ?? "expected");
  const [appointmentTime, setAppointmentTime] = useState(client?.appointment_time ?? "");
  const [garmentSize, setGarmentSize] = useState(client?.garment_size ?? "");
  const [shoeSize, setShoeSize] = useState(client?.shoe_size ?? "");
  const [preferencesRaw, setPreferencesRaw] = useState(
    (client?.preferences ?? []).join(", "),
  );
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !name.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!name.trim()) return;

    setSaving(true);
    const preferences = preferencesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const selectedPersonaId = personas.find((p) => p.name === persona)?.id;
      if (isEdit) {
        await updateClient({
          data: {
            id: client.id,
            name,
            tier,
            store: isAssociate ? ASSOCIATE_STORE : clientStore,
            lifetime_value: lifetimeValue,
            persona,
            persona_id: selectedPersonaId,
            status,
            appointment_time: appointmentTime || undefined,
            garment_size: garmentSize,
            shoe_size: shoeSize,
            preferences,
          },
        });
      } else {
        await createClient({
          data: {
            name,
            tier,
            store: isAssociate ? ASSOCIATE_STORE : clientStore,
            lifetime_value: lifetimeValue,
            persona,
            persona_id: selectedPersonaId,
            status,
            appointment_time: appointmentTime || undefined,
            garment_size: garmentSize,
            shoe_size: shoeSize,
            preferences,
          },
        });
      }
      await router.invalidate();
      toast.success(isEdit ? "Client updated" : "Client created");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl">
            {isEdit ? `Edit ${client.name}` : "New Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
                aria-invalid={nameError}
              />
              {nameError && (
                <p className="text-xs text-destructive">Full Name is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ClientRow["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Store</Label>
              {isAssociate ? (
                <Input value={ASSOCIATE_STORE} disabled className="opacity-60" />
              ) : (
                <Select value={clientStore} onValueChange={setClientStore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Lifetime Value</Label>
              <Input
                placeholder="£0"
                value={lifetimeValue}
                onChange={(e) => setLifetimeValue(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Appointment Time</Label>
              <Input
                placeholder="14:30"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Persona</Label>
              <Select
                value={persona}
                onValueChange={(v) => {
                  setPersona(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a persona…" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Garment Size</Label>
              <Input
                placeholder="IT 40"
                value={garmentSize}
                onChange={(e) => setGarmentSize(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Shoe Size</Label>
              <Input
                placeholder="EU 38"
                value={shoeSize}
                onChange={(e) => setShoeSize(e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Preferences (comma-separated)</Label>
              <Input
                placeholder="Virgin Wool, Oversized Fit, No Logos"
                value={preferencesRaw}
                onChange={(e) => setPreferencesRaw(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
