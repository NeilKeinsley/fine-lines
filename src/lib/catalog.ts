import {
  CATEGORIES,
  PRODUCTS,
  type Category,
  type Product,
} from "./products";

export type CategoryFilter = Category | "All";

/**
 * Catalog encapsulates every read against the product list, so components
 * never index or filter the raw array themselves. When products move to a
 * database, this is the only file that changes.
 */
export class Catalog {
  private readonly products: readonly Product[];

  constructor(products: readonly Product[] = PRODUCTS) {
    this.products = products;
  }

  all(): readonly Product[] {
    return this.products;
  }

  categories(): readonly Category[] {
    return CATEGORIES;
  }

  byCategory(filter: CategoryFilter): readonly Product[] {
    if (filter === "All") return this.products;
    return this.products.filter((p) => p.category === filter);
  }

  find(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  /**
   * Plate number in the "Fig. NN" system. Fig. 01 is reserved for the hero
   * coat; catalog entries continue the sequence in catalog order.
   */
  figNumber(product: Product): string {
    const index = this.products.findIndex((p) => p.id === product.id);
    return String(index + 2).padStart(2, "0");
  }

  /** Other pieces in the same category, for "more like this" rows. */
  related(product: Product, limit = 3): readonly Product[] {
    return this.products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  }
}

/** Shared instance — the storefront has exactly one catalog. */
export const catalog = new Catalog();
