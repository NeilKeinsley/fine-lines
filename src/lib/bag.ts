import { catalog } from "./catalog";
import type { Product } from "./products";
import type { CartLine } from "./cart";

/**
 * Bag is an immutable view over the cart lines: all money and quantity math
 * lives here, so components render values instead of computing them.
 * Construct a fresh one from the store's lines on each render.
 */
export class Bag {
  static readonly FREE_SHIPPING_AT = 2995; // PHP

  private readonly lines: readonly CartLine[];

  constructor(lines: readonly CartLine[]) {
    this.lines = lines;
  }

  get isEmpty(): boolean {
    return this.lines.length === 0;
  }

  get count(): number {
    return this.lines.reduce((n, l) => n + l.qty, 0);
  }

  get subtotal(): number {
    return this.lines.reduce((sum, line) => {
      const product = this.product(line);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
  }

  get amountToFreeShipping(): number {
    return Math.max(0, Bag.FREE_SHIPPING_AT - this.subtotal);
  }

  /** 0–100, for the hairline progress meter. */
  get freeShippingProgress(): number {
    return Math.min(100, (this.subtotal / Bag.FREE_SHIPPING_AT) * 100);
  }

  product(line: CartLine): Product | undefined {
    return catalog.find(line.productId);
  }
}
