"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useCart, cartCount } from "@/lib/cart";

const NAV = [
  { label: "New In", href: "#shop" },
  { label: "Tops", href: "#shop" },
  { label: "Outerwear", href: "#shop" },
  { label: "Dresses", href: "#shop" },
  { label: "Bottoms", href: "#shop" },
];

export function Header() {
  const { lines, open } = useCart();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pop, setPop] = useState(false);
  const count = mounted ? cartCount(lines) : 0;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (count > 0) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* announcement hairline bar */}
      <div className="border-b border-line text-center text-[11px] tracking-[0.18em] uppercase py-1.5 text-muted">
        Free shipping over ₱2,995 · GCash, Maya &amp; cards accepted
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        {/* Logo lockup */}
        <Link href="/" className="group/logo flex flex-col leading-none">
          <span className="font-display text-[26px] font-semibold italic tracking-tight">
            Fine&nbsp;Lines
            <span className="inline-block h-px w-0 bg-accent align-middle ml-2 transition-all duration-500 [transition-timing-function:var(--ease-spring)] group-hover/logo:w-8" />
          </span>
          <span className="mt-1 text-[10px] tracking-[0.22em] uppercase text-muted">
            Created by Neil
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="link-line text-[13px] tracking-[0.08em] uppercase text-muted hover:text-foreground transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:flex h-9 items-center rounded-full border border-line px-4 text-[13px] tracking-wide hover:border-line-strong transition-colors duration-300"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label="Open shopping bag"
            className={`relative flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[13px] text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer ${
              pop ? "cart-pop" : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M6 7h12l1 14H5L6 7Z" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
            </svg>
            Bag
            <span className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] leading-none text-accent-contrast">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
