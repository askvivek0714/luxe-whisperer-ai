export const STORES = [
  "Bond St. Flagship",
  "Mayfair",
  "Paris Faubourg",
  "New York Fifth Ave",
] as const;

export type Store = (typeof STORES)[number];

export const ASSOCIATE_STORE: Store = "Bond St. Flagship";
