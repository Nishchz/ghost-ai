"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

export function LandingFooter() {
  return (
    <footer
      className="border-t py-12 md:py-16"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "var(--accent-primary-dim)",
                  border: "1px solid var(--accent-primary)",
                }}
              >
                <Layers className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                ghost
              </span>
              <span className="text-lg font-bold tracking-tight text-[var(--accent-primary)]">
                AI
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              The collaborative canvas for distributed systems architecture.
              Describe your architecture in plain English, map it in real-time with your team,
              and generate production-ready technical specs.
            </p>

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link
                  href="/#sandbox"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Interactive Sandbox
                </Link>
              </li>
              <li>
                <Link
                  href="/#architecture"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Architecture Flow
                </Link>
              </li>
              <li>
                <Link
                  href="/editor"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Canvas Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  About Ghost AI
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Contact & Sales
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Request Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium text-[var(--accent-primary)]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#security"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Data Security & Isolation
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#training"
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Zero-Training Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p>© 2026 Ghost AI. Built for distributed engineering teams.</p>
          <div className="flex items-center gap-4 text-[var(--text-muted)]">
            <span>Next.js 16 • Liveblocks • React Flow • Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
