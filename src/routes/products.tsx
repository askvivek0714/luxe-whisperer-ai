import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductForm } from "@/components/forms/ProductForm";
import { listProducts, deleteProduct, type ProductRow } from "@/lib/fns/products";
import { resolveProductImage } from "@/lib/assets";
import { useRole, can } from "@/lib/rbac";
import { store } from "@/lib/storage";

export const Route = createFileRoute("/products")({
  loader: () => listProducts(),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products · ABL Clienteling" },
      { name: "description", content: "Product catalogue with stock levels and CRUD management." },
    ],
  }),
});

// ── Product Detail Modal ──────────────────────────────────────────────────────

function ProductDetailModal({ product, onClose }: { product: ProductRow; onClose: () => void }) {
  const recs = store.recommendations.list().filter((r) => r.product_id === product.id);
  const clients = store.clients.list();
  const personas = store.personas.list();

  const recommendedTo = recs
    .map((r) => clients.find((c) => c.id === r.client_id))
    .filter(Boolean) as typeof clients;

  // Persona affinity: which personas have clients recommended this product
  const personaAffinityMap: Record<string, { affinity: number; count: number }> = {};
  recs.forEach((r) => {
    const client = clients.find((c) => c.id === r.client_id);
    if (!client?.persona_id) return;
    if (!personaAffinityMap[client.persona_id]) {
      personaAffinityMap[client.persona_id] = { affinity: 0, count: 0 };
    }
    personaAffinityMap[client.persona_id].affinity += r.affinity;
    personaAffinityMap[client.persona_id].count += 1;
  });
  const personaAffinity = personas
    .map((p) => ({
      name: p.name,
      avg: personaAffinityMap[p.id]
        ? Math.round(personaAffinityMap[p.id].affinity / personaAffinityMap[p.id].count)
        : 0,
    }))
    .filter((p) => p.avg > 0)
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-6 p-8">
          <img
            src={resolveProductImage(product.image)}
            alt={product.name}
            className="w-40 aspect-[2/3] object-cover rounded-sm ring-1 ring-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  SKU {product.sku} · {product.category}
                </p>
                <h2 className="font-serif italic text-3xl leading-tight">{product.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <p className="font-mono text-2xl font-medium mb-6">{product.price}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 border border-border rounded-sm">
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Floor Stock</p>
                <p className="text-lg font-semibold font-mono">{product.floor_stock}</p>
              </div>
              <div className="p-3 border border-border rounded-sm">
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Vault Stock</p>
                <p className="text-lg font-semibold font-mono">{product.vault_stock}</p>
              </div>
            </div>

            {personaAffinity.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="size-3" strokeWidth={1.5} />
                  Persona Affinity
                </p>
                <div className="space-y-3">
                  {personaAffinity.map((p) => (
                    <div key={p.name}>
                      <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                        <span className="text-muted-foreground">{p.name}</span>
                        <span className="text-primary">{p.avg}%</span>
                      </div>
                      <div className="h-px w-full bg-border relative">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary h-0.5 -top-px transition-all"
                          style={{ width: `${p.avg}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendedTo.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Recommended to ({recommendedTo.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedTo.map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] font-mono px-2.5 py-1 bg-accent rounded-full border border-border"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recs.length === 0 && (
              <p className="text-xs text-muted-foreground italic mt-2">
                Not yet included in any active recommendations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProductsPage() {
  const products = Route.useLoaderData();
  const router = useRouter();
  const { role } = useRole();
  const canManage = can(role, "persona.edit");

  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRow | null>(null);

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
              {products.length} product{products.length !== 1 ? "s" : ""} in catalogue. Click any
              product for persona affinity and recommendation data.
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
              onClick={() => setDetailProduct(p)}
              className="bg-card border border-border rounded-sm p-5 flex gap-5 items-center group hover:shadow-md transition-shadow cursor-pointer"
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
                <div
                  className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
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

      {detailProduct && (
        <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />
      )}
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
