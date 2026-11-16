import Link from "next/link";
import {
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Cpu,
  Workflow,
  Sparkles,
  Users2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Ghost AI | Living System Design & Technical Spec Engine",
  description:
    "Learn about Ghost AI, our mission to bridge visual system design with production engineering documentation, and our core architectural principles.",
};

export default function AboutPage() {
  const timeline = [
    {
      era: "1995 – 2010",
      title: "Static Flowcharts & Visio",
      desc: "Architectures were drawn on local desktop software, printed on physical binders, and left to collect dust on office shelves.",
    },
    {
      era: "2010 – 2020",
      title: "Cloud Stencils & PNG Screenshots",
      desc: "Engineers used drag-and-drop vector drawing tools to make cloud diagrams, screenshot them, and paste them into Confluence wikis.",
    },
    {
      era: "2020 – 2025",
      title: "Digital Multiplayer Whiteboards",
      desc: "Sticky notes and unconstrained vector boards created visual brainstorms that could not be parsed, validated, or exported into technical specs.",
    },
    {
      era: "2026 & Beyond",
      title: "Ghost AI: The Computable Living Spec",
      desc: "System design becomes a computational graph. Natural language prompts scaffold topologies, multiplayer consensus drives design reviews, and markdown specs generate automatically.",
    },
  ];

  const pillars = [
    {
      icon: Workflow,
      title: "Visual Graphs with Computational Rigor",
      desc: "Every node in Ghost AI carries real architectural meaning: transport protocols, database engines, and storage semantics. It is a computable system design, not an illustration.",
    },
    {
      icon: Users2,
      title: "Multiplayer Consensus by Default",
      desc: "Distributed systems require consensus. With Liveblocks-powered presence and sub-millisecond sync, architects, leads, and DevOps engineer together in real time.",
    },
    {
      icon: Terminal,
      title: "The End of Documentation Decay",
      desc: "When an architecture evolves, the technical spec must update with it. Ghost AI generates Markdown technical specifications directly from the canonical graph.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Model Training on Customer IP",
      desc: "Your system topologies and proprietary architectures remain strictly yours. We never train public foundation AI models on customer graphs or prompts.",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Header */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-xl border-b px-4 sm:px-8 py-3.5"
        style={{
          backgroundColor: "rgba(11, 11, 14, 0.85)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--accent-primary-dim)",
                border: "1px solid var(--accent-primary)",
              }}
            >
              <Layers className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                ghost
              </span>
              <span className="text-lg font-bold tracking-tight ml-1 text-[var(--accent-primary)]">
                AI
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-xl text-xs sm:text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                Contact Team
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--accent-primary)",
            }}
          >
            <Compass className="h-3.5 w-3.5" />
            Our Mission & Philosophy
          </div>
          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Designing the computational language for distributed systems.
          </h1>
          <p
            className="text-lg sm:text-xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Software engineering has automated testing, continuous integration, and infrastructure-as-code.
            Yet system architecture has remained trapped in static digital drawings.
            We built Ghost AI to change that.
          </p>
        </div>

        {/* Narrative Deep Dive Card */}
        <div
          className="p-8 sm:p-12 rounded-3xl border mb-20"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              The Architecture Documentation Paradox
            </h2>
            <p>
              When engineers start a project, they sketch boxes and arrows on a whiteboard. They debate
              invariants: should we use Kafka or RabbitMQ? How will we enforce idempotency on our payment
              ledger? Which database supports our read-after-write consistency requirements?
            </p>
            <p>
              Someone snaps a screenshot of the board. Another engineer pastes it into a project RFC.
              Within two weeks, implementation begins, trade-offs are made, and the diagram is instantly
              obsolete.
            </p>
            <p>
              The result is architectural drift: new team members read documents that do not reflect
              production reality, while leads waste hours redrawing the same diagrams for every design review.
            </p>
            <p className="text-[var(--text-primary)] font-semibold">
              Ghost AI unifies the architecture canvas and the technical specification into a single living artifact.
            </p>
          </div>
        </div>

        {/* The 4 Architectural Pillars */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Core Engineering Pillars
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              The foundational commitments behind every feature in Ghost AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 sm:p-8 rounded-2xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div>
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                      style={{
                        backgroundColor: "var(--accent-primary-dim)",
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: "var(--accent-primary)" }} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2.5">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline: Evolution of System Design */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              The Evolution of Architecture Tools
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              From static Visio printouts to computable real-time graphs.
            </p>
          </div>

          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div
                key={item.era}
                className="p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                style={{
                  backgroundColor: idx === 3 ? "var(--bg-elevated)" : "var(--bg-surface)",
                  borderColor: idx === 3 ? "var(--accent-primary)" : "var(--border-default)",
                  boxShadow: idx === 3 ? "0 0 25px rgba(0, 200, 212, 0.15)" : "none",
                }}
              >
                <div className="sm:w-1/4">
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                    style={{
                      backgroundColor: idx === 3 ? "var(--accent-primary)" : "var(--bg-base)",
                      color: idx === 3 ? "var(--bg-base)" : "var(--text-muted)",
                    }}
                  >
                    {item.era}
                  </span>
                </div>
                <div className="sm:w-3/4">
                  <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div
          className="p-8 sm:p-12 rounded-3xl border text-center space-y-6"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Experience the new standard in system design.
          </h3>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Build with your team on a live canvas, import starter design templates, or prompt the AI
            to map your architecture in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/editor">
              <Button size="lg" className="rounded-xl gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                Launch Workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl font-medium"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                Contact Sales & Engineering
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
