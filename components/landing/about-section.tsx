"use client";

import {
  Compass,
  Cpu,
  Layers,
  ShieldCheck,
  Users2,
  Terminal,
  Zap,
  Flame,
} from "lucide-react";

export function AboutSection() {
  const pillars = [
    {
      icon: Layers,
      title: "Visual Graphs with Technical Rigor",
      description:
        "Every box on the Ghost AI canvas carries real semantic meaning—service roles, protocols, database engines, and storage semantics. It is not just an illustration; it is a computable system design.",
    },
    {
      icon: Users2,
      title: "Consensus-Driven Multiplayer",
      description:
        "Architectures are decided by engineering teams, not individuals in silos. Real-time Liveblocks collaboration allows leads, architects, and DevOps to design and debate topologies together.",
    },
    {
      icon: Terminal,
      title: "End of Documentation Debt",
      description:
        "When an architecture evolves, engineering specs immediately fall out of date. Ghost AI eliminates this by generating Markdown specifications directly from the verified graph.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy & Enterprise Boundaries",
      description:
        "Your company's system topology and infrastructure design are critical assets. We never train public AI models on your system designs, maintaining strict workspace isolation.",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{
              backgroundColor: "var(--accent-primary-dim)",
              color: "var(--accent-primary)",
            }}
          >
            <Compass className="h-3.5 w-3.5" />
            About Ghost AI
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Turning whiteboard chaos into living technical specs
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Ghost AI was founded on a simple observation: system design is the foundation of all
            software engineering, yet the tools we use to plan it are fragmented, static, and disconnected.
          </p>
        </div>

        {/* Narrative Split */}
        <div
          className="p-8 sm:p-12 rounded-3xl border mb-16"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                The Problem with Traditional System Design
              </h3>
              <p>
                Engineers spend hours drawing architectures on digital whiteboards, taking screenshots,
                and pasting them into markdown wikis. Within two weeks, someone adds a Redis caching layer
                or splits a monolithic service, and the documentation rots.
              </p>
              <p>
                When new engineers join, they are left guessing which diagrams represent production reality
                and which ones represent wishful thinking from six months ago.
              </p>
              <p>
                Ghost AI bridges this divide by turning the architecture canvas into an active workspace.
                Our generative engine translates system requirements into structured graphs, while our spec
                synthesizer converts that visual model into persistent documentation.
              </p>
            </div>

            <div
              className="p-6 sm:p-8 rounded-2xl border space-y-4 font-mono text-xs sm:text-sm"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between border-b pb-3 border-[var(--border-default)]">
                <span className="text-[var(--text-muted)]">Ghost AI Invariants</span>
                <span className="text-[var(--accent-primary)]">v1.0 Ready</span>
              </div>
              <div className="space-y-3 text-[var(--text-secondary)]">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] font-bold">01.</span>
                  <span>Every node represents a concrete runtime entity or boundary.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] font-bold">02.</span>
                  <span>Edges specify transport protocols (HTTP, gRPC, Pub/Sub, TCP).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] font-bold">03.</span>
                  <span>Real-time multiplayer ensures consensus before implementation.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] font-bold">04.</span>
                  <span>Specs are durable Markdown files, ready for git or PRDs.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl border flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div>
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                    style={{
                      backgroundColor: "var(--accent-primary-dim)",
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
                  </div>
                  <h4
                    className="text-base font-bold mb-2 tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
