"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/lib/cart";
import { Bag } from "@/lib/bag";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [pop, setPop] = useState(false);

  // Cart lines come from localStorage; render 0 until mounted to avoid a
  // hydration mismatch.
  const bag = new Bag(mounted ? lines : []);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (bag.count > 0) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [bag.count]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-line bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* announcement hairline bar */}
      <div className="border-b border-line px-3 text-center text-[11px] tracking-[0.18em] uppercase py-1.5 text-muted">
        Free shipping over ₱2,995 · GCash, Maya &amp; cards accepted
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-8">
        {/* Logo lockup */}
        <Link href="/" className="group/logo flex flex-col leading-none">
          <span className="font-display text-[22px] sm:text-[26px] font-semibold italic tracking-tight">
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

        <div className="flex items-center gap-2 sm:gap-3">
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
            className={`relative flex h-9 items-center gap-2 rounded-full bg-foreground px-3 sm:px-4 text-[13px] text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer ${
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
            <span className="hidden sm:inline">Bag</span>
            <span className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] leading-none text-accent-contrast">
              {bag.count}
            </span>
          </button>
          {/* mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line md:hidden cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile nav panel */}
      <div
        className={`md:hidden overflow-hidden border-line transition-all duration-300 [transition-timing-function:var(--ease-spring)] ${
          menuOpen ? "max-h-80 border-t" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-3">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-3 text-[13px] tracking-[0.08em] uppercase text-muted last:border-b-0"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="py-3 text-[13px] tracking-[0.08em] uppercase text-muted"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
