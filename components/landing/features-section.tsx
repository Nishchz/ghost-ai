"use client";

import {
  Sparkles,
  Users,
  FileText,
  Boxes,
  Shapes,
  Cloud,
  CheckCircle2,
  Workflow,
  Cpu,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      iconColor: "var(--accent-ai-text)",
      iconBg: "rgba(100, 87, 249, 0.15)",
      title: "AI Architecture Generation",
      description:
        "Prompt the AI with natural language requirements. Ghost AI designs services, data stores, message queues, and boundary protocols directly onto your shared canvas.",
      highlight: "Durable background task execution",
    },
    {
      icon: Users,
      iconColor: "var(--accent-primary)",
      iconBg: "var(--accent-primary-dim)",
      title: "Real-Time Multiplayer Canvas",
      description:
        "Powered by Liveblocks and React Flow. See teammate cursors, live edits, and collaborative changes with zero-latency synchronization.",
      highlight: "Sub-millisecond presence & live cursors",
    },
    {
      icon: FileText,
      iconColor: "var(--state-success)",
      iconBg: "rgba(52, 211, 153, 0.15)",
      title: "Instant Technical Spec Export",
      description:
        "Convert your live canvas graph into a structured Markdown technical spec with system invariants, boundary models, and failure modes ready for your engineering docs.",
      highlight: "Export-ready Markdown with 1 click",
    },
    {
      icon: Boxes,
      iconColor: "#FF990A",
      iconBg: "rgba(255, 153, 10, 0.15)",
      title: "Curated Starter System Designs",
      description:
        "Jumpstart projects using prebuilt architecture templates: Microservices, Event-Driven CQRS, Serverless Pipelines, and Monoliths with Edge Caching.",
      highlight: "Battle-tested architectural archetypes",
    },
    {
      icon: Shapes,
      iconColor: "#BF7AF0",
      iconBg: "rgba(191, 122, 240, 0.15)",
      title: "Semantic Shapes & Color Palette",
      description:
        "6 standard shapes (Pill, Cylinder, Diamond, Hexagon, Circle, Rectangle) and 8 high-contrast color pairs tuned for deep readability on dark technical canvases.",
      highlight: "Standardized system design visual language",
    },
    {
      icon: Cloud,
      iconColor: "#52A8FF",
      iconBg: "rgba(82, 168, 255, 0.15)",
      title: "Durable Artifact Persistence",
      description:
        "Canvas snapshots and generated technical specs are saved in Vercel Blob, with project metadata, collaborator access, and task run histories secured in PostgreSQL.",
      highlight: "Prisma ORM + Vercel Blob storage layer",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative">
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
            <Workflow className="h-3.5 w-3.5" />
            Core Capabilities
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Engineered for modern distributed systems
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Say goodbye to stale diagram screenshots and disconnected Confluence pages.
            Ghost AI keeps your architecture visual, collaborative, and mathematically grounded.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div>
                  {/* Icon */}
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                    style={{
                      backgroundColor: feature.iconBg,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.iconColor }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold mb-2.5 tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Highlight Badge */}
                <div
                  className="pt-4 border-t flex items-center gap-2 text-xs font-medium"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-muted)",
                  }}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: "var(--accent-primary)" }}
                  />
                  <span>{feature.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
