export type GarmentType =
  | "tee"
  | "shirt"
  | "jacket"
  | "coat"
  | "dress"
  | "skirt"
  | "trousers"
  | "sweater"
  | "blazer";

export type Category = "Tops" | "Outerwear" | "Dresses" | "Bottoms" | "Knitwear";

export interface Product {
  id: string;
  name: string;
  category: Category;
  garment: GarmentType;
  price: number; // PHP
  compareAt?: number;
  badge?: "New" | "Studio favourite" | "Sale";
  blurb: string;
}

export const CATEGORIES: Category[] = [
  "Tops",
  "Outerwear",
  "Dresses",
  "Bottoms",
  "Knitwear",
];

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

/* Blurbs are deliberately uneven in length and shape — see the anti-slop
   field guide (uniform card copy is a tell). Don't "tidy" them back. */
export const PRODUCTS: Product[] = [
  {
    id: "meridian-tee",
    name: "Meridian Tee",
    category: "Tops",
    garment: "tee",
    price: 29,
    badge: "Studio favourite",
    blurb:
      "Heavyweight combed cotton with a set-in sleeve. Garment-dyed, so expect slight variation between runs.",
  },
  {
    id: "half-tuck-oxford",
    name: "Half-Tuck Oxford",
    category: "Tops",
    garment: "shirt",
    price: 49,
    blurb: "Washed until the collar rolls soft.",
  },
  {
    id: "chore-jacket-4",
    name: "Chore Jacket No. 4",
    category: "Outerwear",
    garment: "jacket",
    price: 89,
    badge: "New",
    blurb: "Three patch pockets in 10 oz brushed twill.",
  },
  {
    id: "duster-coat",
    name: "Duster Coat",
    category: "Outerwear",
    garment: "coat",
    price: 120,
    compareAt: 145,
    badge: "Sale",
    blurb: "Floor-skimming, with a placket you have to look twice to find.",
  },
  {
    id: "bias-slip-dress",
    name: "Bias-Cut Slip Dress",
    category: "Dresses",
    garment: "dress",
    price: 69,
    badge: "New",
    blurb: "Cut on the bias so the drape does the talking.",
  },
  {
    id: "pleat-line-skirt",
    name: "Pleat-Line Midi Skirt",
    category: "Bottoms",
    garment: "skirt",
    price: 49,
    blurb: "Knife pleats, pressed permanent.",
  },
  {
    id: "wide-leg-trousers",
    name: "Wide-Leg Trousers",
    category: "Bottoms",
    garment: "trousers",
    price: 59,
    badge: "Studio favourite",
    blurb: "High rise and a deep front pleat. Full break at the hem, so plan your shoes accordingly.",
  },
  {
    id: "ribline-crewneck",
    name: "Ribline Crewneck",
    category: "Knitwear",
    garment: "sweater",
    price: 65,
    blurb: "Merino blend with a wide rib at every edge.",
  },
  {
    id: "boxy-linen-shirt",
    name: "Boxy Linen Shirt",
    category: "Tops",
    garment: "shirt",
    price: 39,
    compareAt: 47,
    badge: "Sale",
    blurb: "European flax, cropped and boxy. Wrinkles are part of the deal.",
  },
  {
    id: "tailored-blazer",
    name: "Tailored Blazer",
    category: "Outerwear",
    garment: "blazer",
    price: 105,
    blurb: "Soft shoulder, one horn button.",
  },
  {
    id: "aline-shirt-dress",
    name: "A-Line Shirt Dress",
    category: "Dresses",
    garment: "dress",
    price: 59,
    blurb: "Belted poplin with a skirt that swings.",
  },
  {
    id: "selvedge-jean",
    name: "Selvedge Straight Jean",
    category: "Bottoms",
    garment: "trousers",
    price: 75,
    blurb: "14 oz Japanese selvedge, chain-stitched at the hem. Stiff for the first two weeks, then it gives in.",
  },
];

/* USD-first pricing (Neil, 2026-07-24). PayMongo settles in PHP; the
   provider converts at checkout using PHP_PER_USD. */
export const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
