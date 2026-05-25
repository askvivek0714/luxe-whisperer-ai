import ariaPortrait from "@/assets/client-aria.jpg";
import julianPortrait from "@/assets/client-julian.jpg";
import isabellePortrait from "@/assets/client-isabelle.jpg";
import overcoat from "@/assets/product-overcoat.jpg";
import tote from "@/assets/product-tote.jpg";
import scarf from "@/assets/product-scarf.jpg";
import loafer from "@/assets/product-loafer.jpg";

export const portraitAssets: Record<string, string> = {
  "client-aria": ariaPortrait,
  "client-julian": julianPortrait,
  "client-isabelle": isabellePortrait,
};

export const productAssets: Record<string, string> = {
  "product-overcoat": overcoat,
  "product-tote": tote,
  "product-scarf": scarf,
  "product-loafer": loafer,
};

export function resolvePortrait(key: string): string {
  return portraitAssets[key] ?? key;
}

export function resolveProductImage(key: string): string {
  return productAssets[key] ?? key;
}
