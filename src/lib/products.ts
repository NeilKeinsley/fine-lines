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
  badge?: "New" | "Best Seller" | "Sale";
  blurb: string;
}

export const CATEGORIES: Category[] = [
  "Tops",
  "Outerwear",
  "Dresses",
  "Bottoms",
  "Knitwear",
];

export const PRODUCTS: Product[] = [
  {
    id: "meridian-tee",
    name: "Meridian Tee",
    category: "Tops",
    garment: "tee",
    price: 1290,
    badge: "Best Seller",
    blurb: "Heavyweight combed cotton, set-in sleeve, garment-dyed.",
  },
  {
    id: "half-tuck-oxford",
    name: "Half-Tuck Oxford",
    category: "Tops",
    garment: "shirt",
    price: 2450,
    blurb: "Washed oxford cloth with a softened collar roll.",
  },
  {
    id: "chore-jacket-4",
    name: "Chore Jacket No. 4",
    category: "Outerwear",
    garment: "jacket",
    price: 4980,
    badge: "New",
    blurb: "Three-pocket workwear cut in 10 oz brushed twill.",
  },
  {
    id: "duster-coat",
    name: "Duster Coat",
    category: "Outerwear",
    garment: "coat",
    price: 6750,
    compareAt: 7900,
    badge: "Sale",
    blurb: "Floor-skimming silhouette with a hidden placket.",
  },
  {
    id: "bias-slip-dress",
    name: "Bias-Cut Slip Dress",
    category: "Dresses",
    garment: "dress",
    price: 3890,
    badge: "New",
    blurb: "Cut on the bias so the drape does the talking.",
  },
  {
    id: "pleat-line-skirt",
    name: "Pleat-Line Midi Skirt",
    category: "Bottoms",
    garment: "skirt",
    price: 2780,
    blurb: "Knife pleats pressed to a permanent crease.",
  },
  {
    id: "wide-leg-trousers",
    name: "Wide-Leg Trousers",
    category: "Bottoms",
    garment: "trousers",
    price: 3150,
    badge: "Best Seller",
    blurb: "High rise, deep pleat, and a full break at the hem.",
  },
  {
    id: "ribline-crewneck",
    name: "Ribline Crewneck",
    category: "Knitwear",
    garment: "sweater",
    price: 3420,
    blurb: "Merino-blend knit with wide ribbing at every edge.",
  },
  {
    id: "boxy-linen-shirt",
    name: "Boxy Linen Shirt",
    category: "Tops",
    garment: "shirt",
    price: 2190,
    compareAt: 2590,
    badge: "Sale",
    blurb: "Airy European flax in a cropped, boxy block.",
  },
  {
    id: "tailored-blazer",
    name: "Tailored Blazer",
    category: "Outerwear",
    garment: "blazer",
    price: 5890,
    blurb: "Soft-shoulder tailoring with a single horn button.",
  },
  {
    id: "aline-shirt-dress",
    name: "A-Line Shirt Dress",
    category: "Dresses",
    garment: "dress",
    price: 3290,
    blurb: "Belted poplin shirt dress that moves like a sketch.",
  },
  {
    id: "selvedge-jean",
    name: "Selvedge Straight Jean",
    category: "Bottoms",
    garment: "trousers",
    price: 3680,
    blurb: "14 oz Japanese selvedge, chain-stitched hem.",
  },
];

export const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 0 });
