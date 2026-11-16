"use client";

import { useState } from "react";
import {
  Sparkles,
  Users,
  FileCode,
  Layers,
  CircleCheck,
  MousePointer2,
  Cpu,
  Database,
  ArrowRight,
  Shield,
  Workflow,
} from "lucide-react";

export function CanvasPreview() {
  const [activeTab, setActiveTab] = useState<"canvas" | "spec" | "prompt">("canvas");
  const [selectedNode, setSelectedNode] = useState<string>("order-service");

  const nodes = [
    {
      id: "client-edge",
      label: "Client App / Web & Mobile",
      sublabel: "Cloudflare CDN Edge",
      type: "rectangle",
      color: "#1F1F1F",
      textColor: "#EDEDED",
      badge: "Edge",
      x: 30,
      y: 110,
    },
    {
      id: "api-gateway",
      label: "Kong API Gateway",
      sublabel: "TLS Termination & Rate Limit",
      type: "pill",
      color: "#10233D",
      textColor: "#52A8FF",
      badge: "Ingress",
      x: 230,
      y: 110,
    },
    {
      id: "auth-service",
      label: "Auth & Session Verifier",
      sublabel: "JWT & Clerk Webhooks",
      type: "rectangle",
      color: "#2E1938",
      textColor: "#BF7AF0",
      badge: "Security",
      x: 440,
      y: 30,
    },
    {
      id: "order-service",
      label: "Order Ledger Service",
      sublabel: "Idempotent Transaction Core",
      type: "pill",
      color: "#062822",
      textColor: "#0AC7B4",
      badge: "Core Service",
      x: 440,
      y: 180,
    },
    {
      id: "event-broker",
      label: "Kafka Event Broker",
      sublabel: "Partitioned Order Topics",
      type: "hexagon",
      color: "#331B00",
      textColor: "#FF990A",
      badge: "Pub/Sub",
      x: 660,
      y: 180,
    },
    {
      id: "postgres-db",
      label: "PostgreSQL Database",
      sublabel: "ACID Orders & Line Items",
      type: "cylinder",
      color: "#0F2E18",
      textColor: "#62C073",
      badge: "Storage",
      x: 440,
      y: 300,
    },
    {
      id: "redis-cache",
      label: "Redis Idempotency Cache",
      sublabel: "Locking & TTL Buffer",
      type: "cylinder",
      color: "#3C1618",
      textColor: "#FF6166",
      badge: "Cache",
      x: 230,
      y: 300,
    },
  ];

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-all"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* Top Workspace Chrome Bar */}
      <div
        className="flex flex-wrap items-center justify-between border-b px-4 py-3 gap-3"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Left: Project title & status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              distributed-checkout-pipeline
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: "var(--accent-primary-dim)",
                color: "var(--accent-primary)",
                border: "1px solid rgba(0, 200, 212, 0.25)",
              }}
            >
              <CircleCheck className="h-3 w-3" />
              Live Consensus
            </span>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div
          className="flex items-center rounded-xl p-1 border text-xs font-medium"
          style={{
            backgroundColor: "var(--bg-base)",
            borderColor: "var(--border-default)",
          }}
        >
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === "canvas"
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Canvas Graph
          </button>
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === "spec"
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            Generated Spec (.md)
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === "prompt"
                ? "bg-[var(--bg-elevated)] text-[var(--accent-ai-text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Prompt Stream
          </button>
        </div>

        {/* Right: Active Collaborators */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-[var(--bg-elevated)] text-white"
              style={{ backgroundColor: "#00c8d4" }}
              title="Sarah (Architect)"
            >
              SL
            </div>
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-[var(--bg-elevated)] text-white"
              style={{ backgroundColor: "#6457f9" }}
              title="Devin (Infra)"
            >
              DK
            </div>
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-[var(--bg-elevated)]"
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--accent-primary)",
              }}
              title="Ghost AI Copilot"
            >
              <Cpu className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="hidden lg:inline text-xs font-medium text-[var(--text-muted)]">
            3 active
          </span>
        </div>
      </div>

      {/* Main Canvas Body */}
      {activeTab === "canvas" && (
        <div
          className="relative min-h-[420px] w-full p-4 sm:p-6 overflow-x-auto select-none"
          style={{
            backgroundColor: "var(--bg-base)",
            backgroundImage:
              "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Simulated Real-Time Presence Tags */}
          <div className="absolute top-6 left-8 z-20 flex items-center gap-1.5 animate-pulse">
            <MousePointer2
              className="h-4 w-4 transform -rotate-45"
              style={{ color: "var(--accent-primary)" }}
            />
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-medium shadow-md"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--bg-base)",
              }}
            >
              Sarah L. (Refining Ledger)
            </span>
          </div>

          <div className="absolute bottom-8 right-12 z-20 hidden sm:flex items-center gap-1.5">
            <MousePointer2
              className="h-4 w-4 transform -rotate-45"
              style={{ color: "var(--accent-ai-text)" }}
            />
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-medium shadow-md"
              style={{
                backgroundColor: "var(--accent-ai)",
                color: "#ffffff",
              }}
            >
              Ghost AI: Generated 7 nodes, 9 edges
            </span>
          </div>

          {/* Canvas Interactive Nodes Grid */}
          <div className="relative min-w-[760px] h-[380px] mx-auto">
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--border-subtle)" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--accent-primary)" />
                </marker>
              </defs>

              {/* Edge 1: Client -> API Gateway */}
              <path
                d="M 170 145 L 230 145"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow)"
              />
              <text x="178" y="137" fill="var(--text-faint)" fontSize="10" fontFamily="monospace">
                HTTPS
              </text>

              {/* Edge 2: API Gateway -> Auth */}
              <path
                d="M 330 130 C 370 130, 390 65, 440 65"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow)"
              />
              <text x="365" y="85" fill="var(--text-faint)" fontSize="10" fontFamily="monospace">
                mTLS
              </text>

              {/* Edge 3: API Gateway -> Order Service */}
              <path
                d="M 330 145 C 370 145, 390 215, 440 215"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow-active)"
              />
              <text x="360" y="170" fill="var(--accent-primary)" fontSize="10" fontFamily="monospace">
                gRPC
              </text>

              {/* Edge 4: Order Service -> Kafka */}
              <path
                d="M 580 215 L 660 215"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow)"
              />
              <text x="595" y="207" fill="var(--text-faint)" fontSize="10" fontFamily="monospace">
                Pub/Sub
              </text>

              {/* Edge 5: Order Service -> Postgres */}
              <path
                d="M 510 245 L 510 300"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrow)"
              />
              <text x="518" y="278" fill="var(--text-faint)" fontSize="10" fontFamily="monospace">
                ACID TX
              </text>

              {/* Edge 6: Order Service -> Redis */}
              <path
                d="M 440 225 C 360 225, 360 315, 320 325"
                stroke="var(--border-subtle)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#arrow)"
              />
              <text x="345" y="295" fill="var(--text-faint)" fontSize="10" fontFamily="monospace">
                SETNX 60s
              </text>
            </svg>

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className="absolute cursor-pointer transition-all duration-150 z-10"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: node.type === "rectangle" ? "170px" : "150px",
                  }}
                >
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "ring-2 ring-[var(--accent-primary)] shadow-lg scale-105"
                        : "hover:border-[var(--border-subtle)] hover:scale-102"
                    }`}
                    style={{
                      backgroundColor: node.color,
                      borderColor: isSelected
                        ? "var(--accent-primary)"
                        : "var(--border-default)",
                      color: node.textColor,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          color: node.textColor,
                        }}
                      >
                        {node.badge}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono">
                        {node.type}
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-tight mb-1 truncate">
                      {node.label}
                    </div>
                    <div className="text-[11px] opacity-75 leading-tight">
                      {node.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Canvas Toolbar simulation */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: "rgba(24, 24, 28, 0.85)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="text-[11px] font-mono">Nodes: 7</span>
              <span>•</span>
              <span className="text-[11px] font-mono">Edges: 6</span>
              <span>•</span>
              <span className="text-[11px] font-mono text-[var(--accent-primary)]">
                Selected: {selectedNode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spec Output Tab */}
      {activeTab === "spec" && (
        <div
          className="p-6 sm:p-8 font-mono text-xs sm:text-sm overflow-y-auto max-h-[460px] leading-relaxed"
          style={{
            backgroundColor: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-[var(--accent-primary)]" />
              <span className="font-semibold text-[var(--text-primary)]">
                specs/distributed-checkout-pipeline/spec-v1.md
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--state-success)]">
              Verified Graph
            </span>
          </div>

          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-[var(--text-secondary)]">
{`# Technical Specification: Distributed Checkout & Order Ledger Pipeline

## 1. System Overview
The distributed checkout architecture handles incoming client traffic via edge-terminated TLS, enforces identity verification through Clerk JWT webhooks, and delegates transactional mutations to an idempotent Order Ledger Service.

## 2. Invariants & Guarantees
- **Idempotency Guarantee**: Every mutating request contains a deterministic \`Idempotency-Key\`. Checked via Redis \`SETNX\` with a 60-second TTL before ledger write.
- **Transactional Consistency**: Order persistence executes inside PostgreSQL serializable transactions.
- **Asynchronous Fanout**: Committed orders emit events to the \`orders.created.v1\` Kafka topic for downstream fulfillment and notification services.

## 3. Component Boundaries
| Service / Node | Topology | Protocol | SLA / Target |
| :--- | :--- | :--- | :--- |
| **Kong API Gateway** | 3x Multi-AZ | HTTPS/TLS 1.3 | p99 < 8ms |
| **Auth Verifier** | Serverless Edge | mTLS | p99 < 12ms |
| **Order Ledger Core**| Kubernetes Pods| gRPC HTTP/2 | p99 < 35ms |
| **Kafka Event Broker**| 5-node Cluster | TCP Binary | Zero Data Loss |
| **PostgreSQL DB** | Multi-AZ Primary | TCP / SSL | 99.99% Uptime |

## 4. Failure Modes & Degradation
- **Cache Eviction / Downtime**: Ledger falls back to PostgreSQL unique constraint indexes on (tenant_id, idempotency_key).
- **Broker Partition**: Orders are staged to a local transactional outbox table and retried with exponential backoff.`}
          </pre>
        </div>
      )}

      {/* AI Prompt Stream Tab */}
      {activeTab === "prompt" && (
        <div
          className="p-6 sm:p-8 font-mono text-xs sm:text-sm overflow-y-auto max-h-[460px]"
          style={{
            backgroundColor: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-2 border-b pb-3 mb-4 border-[var(--border-default)]">
            <Sparkles className="h-4 w-4 text-[var(--accent-ai-text)]" />
            <span className="font-semibold text-[var(--text-primary)]">
              AI Generation Stream Log
            </span>
          </div>

          <div className="space-y-4">
            <div
              className="p-3.5 rounded-xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Natural Language Prompt
              </div>
              <p className="text-[var(--text-primary)] font-sans text-sm">
                &ldquo;Architect a resilient checkout pipeline with rate-limited API gateway,
                Clerk auth validation, an idempotent Order Ledger service using Redis distributed locks,
                PostgreSQL for persistence, and Kafka for asynchronous order event broadcasting.&rdquo;
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-2 text-[var(--state-success)]">
                <CircleCheck className="h-3.5 w-3.5" />
                <span>Identified 7 primary components and 6 boundary interactions</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <CircleCheck className="h-3.5 w-3.5" />
                <span>Applied semantic geometric shapes: Pill (Services), Cylinder (Storage), Hexagon (Broker)</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--accent-ai-text)]">
                <CircleCheck className="h-3.5 w-3.5" />
                <span>Derived system invariants: idempotency keys, outbox pattern, serialized transactions</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <CircleCheck className="h-3.5 w-3.5" />
                <span>Rendered Liveblocks graph nodes and edges to active room</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
