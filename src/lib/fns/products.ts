"use server";
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/lib/db";

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

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  return db.prepare("SELECT * FROM products ORDER BY name ASC").all() as ProductRow[];
});

export const getProduct = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    return db.prepare("SELECT * FROM products WHERE id = ?").get(data.id) as
      | ProductRow
      | undefined;
  },
);

export const createProduct = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: ProductInput }) => {
    const db = getDb();
    const id =
      data.id ??
      "P-" +
        Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase();
    db.prepare(`
      INSERT INTO products (id, sku, name, category, price, image, floor_stock, vault_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.sku,
      data.name,
      data.category ?? "",
      data.price ?? "",
      data.image ?? "",
      data.floor_stock ?? 0,
      data.vault_stock ?? 0,
    );
    return { id };
  },
);

export const updateProduct = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: ProductInput & { id: string } }) => {
    const db = getDb();
    db.prepare(`
      UPDATE products SET sku=?, name=?, category=?, price=?, image=?, floor_stock=?, vault_stock=?
      WHERE id=?
    `).run(
      data.sku,
      data.name,
      data.category ?? "",
      data.price ?? "",
      data.image ?? "",
      data.floor_stock ?? 0,
      data.vault_stock ?? 0,
      data.id,
    );
    return { ok: true };
  },
);

export const deleteProduct = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { id: string } }) => {
    const db = getDb();
    db.prepare("DELETE FROM products WHERE id = ?").run(data.id);
    return { ok: true };
  },
);
