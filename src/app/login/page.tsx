"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { GarmentArt } from "@/components/garment-art";
import { Reveal } from "@/components/reveal";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-[22px] font-semibold italic tracking-tight">
            Fine&nbsp;Lines
          </span>
          <span className="mt-1 text-[9px] tracking-[0.22em] uppercase text-muted">
            Created by Neil
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="link-line text-sm text-muted hover:text-foreground">
            ← Back to shop
          </Link>
        </div>
      </header>

      <main className="grid flex-1 md:grid-cols-2">
        {/* Editorial panel */}
        <div className="relative hidden items-center justify-center border-r border-line bg-card/60 md:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
            }}
          />
          <Reveal>
            <figure className="relative border border-line bg-background p-10">
              <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
              <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
              <GarmentArt type="blazer" autodraw className="h-72 w-auto text-foreground" />
              <figcaption className="mt-5 border-t border-line pt-4 text-center text-[11px] tracking-[0.2em] uppercase text-muted">
                Members see the lookbook first.
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Auth card */}
        <div className="flex items-center justify-center px-5 py-14 sm:px-10">
          <Reveal className="w-full max-w-sm">
            <div>
              <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
                <span className="inline-block h-px w-10 bg-accent" />
                {mode === "signin" ? "Welcome back" : "Join the line"}
              </p>
              <h1 className="font-display text-4xl font-medium tracking-tight">
                {mode === "signin" ? "Sign in." : "Create account."}
              </h1>

              {/* mode switch */}
              <div className="mt-6 flex border border-line text-[13px]">
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setSent(false);
                    }}
                    className={`flex-1 py-2.5 transition-colors duration-300 cursor-pointer ${
                      mode === m
                        ? "bg-foreground text-background"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form
                className="mt-6 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                {mode === "signup" && (
                  <label className="block">
                    <span className="text-[11px] tracking-[0.18em] uppercase text-muted">Name</span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      className="mt-1.5 w-full border-b border-line-strong bg-transparent py-2 text-sm outline-none transition-colors duration-300 focus:border-accent placeholder:text-muted"
                      placeholder="Your name"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-muted">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1.5 w-full border-b border-line-strong bg-transparent py-2 text-sm outline-none transition-colors duration-300 focus:border-accent placeholder:text-muted"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-muted">Password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="mt-1.5 w-full border-b border-line-strong bg-transparent py-2 text-sm outline-none transition-colors duration-300 focus:border-accent placeholder:text-muted"
                    placeholder="••••••••"
                  />
                </label>

                {sent && (
                  <p className="border border-line bg-card px-4 py-3 text-xs leading-relaxed text-muted">
                    Auth backend lands next sprint (Better Auth — self-hosted
                    sessions, Google sign-in, guest checkout stays available).
                    Nothing was submitted.
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-shimmer w-full rounded-full bg-foreground py-3 text-sm text-background hover:scale-[1.02] transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
                >
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted">or</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={() => setSent(true)}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-line py-3 text-sm hover:border-line-strong transition-colors duration-300 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M21.35 11.1H12v2.9h5.4c-.5 2.5-2.6 3.9-5.4 3.9a6 6 0 1 1 0-12c1.5 0 2.9.6 4 1.5l2.2-2.2A9 9 0 1 0 12 21c5.2 0 8.7-3.7 8.7-8.9 0-.3 0-.7-.1-1Z"
                  />
                </svg>
                Continue with Google
              </button>

              <p className="mt-6 text-center text-xs leading-relaxed text-muted">
                No account needed to shop — guest checkout is always available.
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      <footer className="border-t border-line py-4 text-center text-[11px] tracking-[0.14em] uppercase text-muted">
        © 2026 Fine Lines — <span className="text-accent">Created by Neil</span>
      </footer>
    </div>
  );
}
