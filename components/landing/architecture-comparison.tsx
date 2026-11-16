"use client";

import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function ArchitectureComparison() {
  const comparisons = [
    {
      metric: "System Representation",
      before: "Static shapes and PNG screenshots pasted into outdated wikis.",
      after: "Canonical computable graph with real-time semantic schemas and protocols.",
    },
    {
      metric: "Documentation Sync",
      before: "Manually written docs that rot two weeks after architectural changes.",
      after: "Instant Markdown spec generation compiled directly from the active graph.",
    },
    {
      metric: "Team Consensus",
      before: "Siloed whiteboard sessions with no multiplayer alignment or history.",
      after: "Live multiplayer consensus powered by Liveblocks with remote presence.",
    },
    {
      metric: "Architectural Invariants",
      before: "Implicit assumptions trapped in engineers' heads until production incidents.",
      after: "Explicitly defined invariants, SLA thresholds, and verified failure modes.",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--accent-primary)",
            }}
          >
            The Architectural Shift
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Why engineering teams move to Ghost AI
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Traditional diagram tools treat systems as artwork. Ghost AI treats systems as
            living, collaborative engineering specifications.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Legacy Whiteboards Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl border space-y-6"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="border-b pb-4 border-[var(--border-default)]">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--state-error)] font-bold">
                Legacy Approach
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                Static Whiteboards & Screenshots
              </h3>
            </div>

            <div className="space-y-4">
              {comparisons.map((c) => (
                <div key={c.metric} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-[var(--state-error)] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      {c.metric}
                    </span>
                    <span className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {c.before}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ghost AI Living Specs Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl border space-y-6 relative overflow-hidden"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--accent-primary)",
              boxShadow: "0 0 30px rgba(0, 200, 212, 0.1)",
            }}
          >
            {/* Subtle Accent Glow */}
            <div
              className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />

            <div className="border-b pb-4 border-[var(--border-subtle)]">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--accent-primary)] font-bold">
                The Ghost AI Platform
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                Living Architecture & Auto Specs
              </h3>
            </div>

            <div className="space-y-4">
              {comparisons.map((c) => (
                <div key={c.metric} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[var(--state-success)] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      {c.metric}
                    </span>
                    <span className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {c.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
