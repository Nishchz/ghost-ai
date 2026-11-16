"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnterpriseCTAProps {
  isAuthenticated?: boolean;
}

export function EnterpriseCTA({ isAuthenticated = false }: EnterpriseCTAProps) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl p-8 sm:p-14 lg:p-16 border overflow-hidden text-center shadow-2xl"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[120px] opacity-25 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--accent-primary) 0%, var(--accent-ai) 100%)",
            }}
          />

          <div className="relative mx-auto max-w-3xl space-y-6">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-primary)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start Designing in Seconds
            </div>

            <h2
              className="text-3xl sm:text-5xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Turn your system ideas into verified technical specs today.
            </h2>

            <p
              className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Zero setup required. Open the canvas, import a starter architecture or prompt the AI,
              and invite your team for real-time collaboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href={isAuthenticated ? "/editor" : "/sign-up"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  {isAuthenticated ? "Open Workspace" : "Get Started Free"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-medium rounded-xl gap-2"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Terminal className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                  Talk with Systems Engineer
                </Button>
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--state-success)]" />
                <span>Zero model training on customer graphs</span>
              </div>
              <div>•</div>
              <div>No credit card required</div>
              <div>•</div>
              <div>Instant Markdown export</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
