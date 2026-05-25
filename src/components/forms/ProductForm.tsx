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
import { createProduct, updateProduct, type ProductRow } from "@/lib/fns/products";

type Props = {
  open: boolean;
  onClose: () => void;
  product?: ProductRow;
};

const CATEGORIES = ["Outerwear", "Leather Goods", "Accessories", "Footwear", "Ready-to-Wear", "Jewellery"];

export function ProductForm({ open, onClose, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [sku, setSku] = useState(product?.sku ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [price, setPrice] = useState(product?.price ?? "");
  const [floorStock, setFloorStock] = useState(String(product?.floor_stock ?? 0));
  const [vaultStock, setVaultStock] = useState(String(product?.vault_stock ?? 0));
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !name.trim();
  const skuError = submitted && !sku.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!name.trim() || !sku.trim()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct({
          data: {
            id: product.id,
            sku,
            name,
            category,
            price,
            image: product.image,
            floor_stock: parseInt(floorStock) || 0,
            vault_stock: parseInt(vaultStock) || 0,
          },
        });
      } else {
        await createProduct({
          data: {
            sku,
            name,
            category,
            price,
            floor_stock: parseInt(floorStock) || 0,
            vault_stock: parseInt(vaultStock) || 0,
          },
        });
      }
      await router.invalidate();
      toast.success(isEdit ? "Product updated" : "Product created");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl">
            {isEdit ? `Edit ${product.name}` : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
                aria-invalid={nameError}
              />
              {nameError && (
                <p className="text-xs text-destructive">Product Name is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={skuError ? "border-destructive focus-visible:ring-destructive" : ""}
                aria-invalid={skuError}
              />
              {skuError && (
                <p className="text-xs text-destructive">SKU is required</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Price</Label>
              <Input placeholder="£0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Floor Stock</Label>
              <Input
                type="number"
                min={0}
                value={floorStock}
                onChange={(e) => setFloorStock(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vault Stock</Label>
              <Input
                type="number"
                min={0}
                value={vaultStock}
                onChange={(e) => setVaultStock(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
