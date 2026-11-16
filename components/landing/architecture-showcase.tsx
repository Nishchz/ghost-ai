"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Code2,
  Copy,
  Terminal,
  Layers,
  FileText,
  Workflow,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArchitectureShowcase() {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"event-driven" | "microservices" | "serverless">("event-driven");

  const templates = {
    "event-driven": {
      name: "Event-Driven CQRS",
      description: "High-throughput event streaming with Kafka, read-model materialization, and PostgreSQL command ledger.",
      nodesCount: 9,
      edgesCount: 11,
      invariants: [
        "Command execution guarantees ACID serializability",
        "Read models sync asynchronously via Kafka consumer groups",
        "Outbox pattern prevents dual-write failures",
      ],
      markdownSnippet: `## Event-Driven CQRS Architecture Spec

### 1. Invariants & Storage
- **Command Store**: PostgreSQL multi-AZ cluster with optimistic concurrency control.
- **Event Bus**: Apache Kafka (3 partitions per region) with exactly-once delivery.
- **Read Cache**: Redis cluster populated by projection workers.

### 2. Service Topology
- \`Ingress API\` -> \`Command Validator\` -> \`PostgreSQL Ledger\`
- \`Debezium CDC\` -> \`Kafka Topics: orders.v1\` -> \`Projection Workers\` -> \`Elasticsearch / Redis\``,
    },
    "microservices": {
      name: "Microservices Mesh",
      description: "Distributed domain-driven services decoupled via gRPC, service discovery, and central API Gateway.",
      nodesCount: 12,
      edgesCount: 16,
      invariants: [
        "All inter-service RPCs strictly authenticated via mTLS",
        "API Gateway handles rate limiting, JWT validation, and routing",
        "Independent database-per-service isolation",
      ],
      markdownSnippet: `## Microservices Mesh Spec

### 1. Topology & Protocols
- **API Gateway**: Envoy proxy with rate limiting and path-based routing.
- **Service Mesh**: Istio with mTLS enforcement between pods.
- **Service Boundaries**: User Service, Inventory Service, Billing Service.

### 2. Invariants
- Each microservice owns its private PostgreSQL database instance.
- No direct database access across service boundaries.`,
    },
    "serverless": {
      name: "Serverless Edge Pipeline",
      description: "Auto-scaling event pipeline using Edge Functions, Cloudflare Workers, and serverless vector/relational databases.",
      nodesCount: 7,
      edgesCount: 8,
      invariants: [
        "Stateless compute executed at the edge nearest to the user",
        "Connection pooling managed via Neon / Prisma Accelerate",
        "Durable asynchronous workflows triggered via background queues",
      ],
      markdownSnippet: `## Serverless Edge Pipeline Spec

### 1. Edge & Compute
- **Ingress**: Cloudflare Edge Workers with sub-5ms cold starts.
- **Durable Tasks**: Trigger.dev background workers for heavy async processing.
- **Storage**: Prisma Postgres + Vercel Blob for immutable canvas snapshots.

### 2. Security & Boundaries
- Ephemeral tokens verified at the edge before hitting database pools.`,
    },
  };

  const current = templates[selectedTemplate];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="py-20 md:py-28 relative">
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
            The Ghost AI Workflow
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            From natural language to technical reality
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Watch how simple requirements transform into full system topologies with
            verified invariants and exportable Markdown specifications.
          </p>
        </div>

        {/* 3 Step Interactive Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Step 1 */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold mb-4"
                style={{
                  backgroundColor: "var(--accent-ai)",
                  color: "#ffffff",
                }}
              >
                01
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Describe Your System
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                Prompt Ghost AI with your architectural requirements, cloud providers, and scale
                targets in natural language.
              </p>
            </div>
            <div
              className="p-3 rounded-xl border font-mono text-xs"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-ai-text)",
              }}
            >
              &ldquo;Design a multi-region Kafka event pipeline with Postgres CDC and Redis cache...&rdquo;
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold mb-4"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--bg-base)",
                }}
              >
                02
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Multiplayer Refinement
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                Collaborate on the Liveblocks canvas. Drag semantic shapes, adjust protocols, and
                review architectures with your team in real time.
              </p>
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-xl border text-xs"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <Share2 className="h-3.5 w-3.5" style={{ color: "var(--accent-primary)" }} />
              <span>Multi-user live cursors & room consensus</span>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold mb-4"
                style={{
                  backgroundColor: "var(--state-success)",
                  color: "var(--bg-base)",
                }}
              >
                03
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Export Markdown Spec
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                Convert your canvas graph into persistent Markdown technical specs with invariants,
                component boundaries, and SLA criteria.
              </p>
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-xl border text-xs"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-subtle)",
                color: "var(--state-success)",
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>spec.md generated & saved to Vercel Blob</span>
            </div>
          </div>
        </div>

        {/* Interactive Template & Spec Explorer Box */}
        <div
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          {/* Header Bar */}
          <div
            className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b gap-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
            }}
          >
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[var(--accent-primary)] mb-1">
                Interactive Architecture Template Explorer
              </div>
              <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {current.name}
              </div>
            </div>

            {/* Template Selector Pills */}
            <div
              className="flex items-center gap-1.5 p-1 rounded-xl border text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-default)",
              }}
            >
              {(["event-driven", "microservices", "serverless"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    selectedTemplate === key
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {key.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Details & Live Code Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-default)]">
            {/* Left Column: Properties & Invariants */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Architecture Overview
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-6">
                  {current.description}
                </p>

                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  System Invariants & Guarantees
                </h4>
                <ul className="space-y-2.5">
                  {current.invariants.map((inv, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]"
                    >
                      <CheckCircle
                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--accent-primary)" }}
                      />
                      <span>{inv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats Bar */}
              <div
                className="flex items-center justify-around p-3.5 rounded-2xl border text-center"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div>
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {current.nodesCount}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Active Nodes</div>
                </div>
                <div className="h-6 w-[1px] bg-[var(--border-default)]" />
                <div>
                  <div className="text-xl font-bold font-mono text-[var(--accent-primary)]">
                    {current.edgesCount}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Verified Edges</div>
                </div>
                <div className="h-6 w-[1px] bg-[var(--border-default)]" />
                <div>
                  <div className="text-xl font-bold font-mono text-[var(--state-success)]">
                    100%
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Spec Grounded</div>
                </div>
              </div>
            </div>

            {/* Right Column: Markdown Spec Output Preview */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between" style={{ backgroundColor: "var(--bg-base)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <Terminal className="h-4 w-4 text-[var(--accent-ai-text)]" />
                  <span>Output Preview: technical-spec.md</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1.5 rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy Spec"}
                </Button>
              </div>

              <pre
                className="font-mono text-xs sm:text-sm p-4 rounded-xl border overflow-x-auto leading-relaxed"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                {current.markdownSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
