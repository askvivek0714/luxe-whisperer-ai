import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductForm } from "@/components/forms/ProductForm";
import { listProducts, deleteProduct, type ProductRow } from "@/lib/fns/products";
import { resolveProductImage } from "@/lib/assets";
import { useRole, can } from "@/lib/rbac";

export const Route = createFileRoute("/products")({
  loader: () => listProducts(),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products · Maison Vaurien" },
      { name: "description", content: "Product catalogue with stock levels and CRUD management." },
    ],
  }),
});

function ProductsPage() {
  const products = Route.useLoaderData();
  const router = useRouter();
  const { role } = useRole();
  const canManage = can(role, "persona.edit");

  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await deleteProduct({ data: { id } });
    await router.invalidate();
    setDeletingId(null);
  }

  return (
    <AppShell title="Product Catalogue">
      <div className="px-8 py-10 max-w-5xl mx-auto animate-slide-up">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Inventory
            </p>
            <h2 className="font-serif text-4xl">Products</h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              {products.length} product{products.length !== 1 ? "s" : ""} in catalogue with floor
              and vault stock levels.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-foreground text-background text-[10px] uppercase tracking-widest font-semibold px-5 py-3 rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="size-3" strokeWidth={2} />
              New Product
            </button>
          )}
        </div>

        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border rounded-sm p-5 flex gap-5 items-center group hover:shadow-md transition-shadow"
            >
              <img
                src={resolveProductImage(p.image)}
                alt={p.name}
                className="size-16 rounded-sm object-cover ring-1 ring-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif italic text-lg leading-tight">{p.name}</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">
                  SKU {p.sku} · {p.category}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm font-medium">{p.price}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Floor {p.floor_stock} · Vault {p.vault_stock}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditProduct(p)}
                    className="p-2 border border-border rounded-sm hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeletingId(p.id)}
                    className="p-2 border border-destructive/30 rounded-sm hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {products.length === 0 && (
            <p className="text-center text-muted-foreground italic py-16">
              No products in catalogue. Add one to get started.
            </p>
          )}
        </div>
      </div>

      {showCreate && <ProductForm open={showCreate} onClose={() => setShowCreate(false)} />}
      {editProduct && (
        <ProductForm open={true} onClose={() => setEditProduct(null)} product={editProduct} />
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full">
            <h3 className="font-serif text-xl italic mb-2">Delete product?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This product will be permanently removed from the catalogue and all recommendations
              referencing it will be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 border border-border hover:bg-accent/60 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="text-[10px] uppercase tracking-widest px-5 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
