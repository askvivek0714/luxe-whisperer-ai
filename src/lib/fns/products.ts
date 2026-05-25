import { store, ensureSeeded } from "@/lib/storage";

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: string;
  image: string;
  floor_stock: number;
  vault_stock: number;
};

export type ProductInput = {
  id?: string;
  sku: string;
  name: string;
  category?: string;
  price?: string;
  image?: string;
  floor_stock?: number;
  vault_stock?: number;
};

export async function listProducts(): Promise<ProductRow[]> {
  ensureSeeded();
  return store.products.list().sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct({
  data,
}: {
  data: { id: string };
}): Promise<ProductRow | undefined> {
  ensureSeeded();
  return store.products.get(data.id) ?? undefined;
}

export async function createProduct({
  data,
}: {
  data: ProductInput;
}): Promise<{ id: string }> {
  ensureSeeded();
  const id =
    data.id ??
    "P-" +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
  const newProduct: ProductRow = {
    id,
    sku: data.sku,
    name: data.name,
    category: data.category ?? "",
    price: data.price ?? "",
    image: data.image ?? "",
    floor_stock: data.floor_stock ?? 0,
    vault_stock: data.vault_stock ?? 0,
  };
  store.products.save([...store.products.list(), newProduct]);
  return { id };
}

export async function updateProduct({
  data,
}: {
  data: ProductInput & { id: string };
}): Promise<{ ok: true }> {
  ensureSeeded();
  const products = store.products.list();
  const existing = products.find((p) => p.id === data.id);
  if (!existing) throw new Error("Product not found");
  const updated: ProductRow = {
    ...existing,
    sku: data.sku,
    name: data.name,
    category: data.category ?? existing.category,
    price: data.price ?? existing.price,
    image: data.image ?? existing.image,
    floor_stock: data.floor_stock ?? existing.floor_stock,
    vault_stock: data.vault_stock ?? existing.vault_stock,
  };
  store.products.save(products.map((p) => (p.id === data.id ? updated : p)));
  return { ok: true };
}

export async function deleteProduct({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  ensureSeeded();
  store.products.save(store.products.list().filter((p) => p.id !== data.id));
  // cascade: delete recommendations for this product
  store.recommendations.save(
    store.recommendations.list().filter((r) => r.product_id !== data.id),
  );
  return { ok: true };
}
