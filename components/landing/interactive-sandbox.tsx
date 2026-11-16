"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Database,
  ArrowRight,
  Shield,
  Workflow,
  Copy,
  Server,
  Zap,
  Globe,
  Radio,
  FileCode,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ArchetypeKey = "fintech" | "aws-ecommerce" | "gcp-dataflow";

interface NodeItem {
  id: string;
  label: string;
  role: string;
  cloud: string;
  type: "rectangle" | "pill" | "cylinder" | "hexagon";
  color: string;
  textColor: string;
  x: number;
  y: number;
  protocol: string;
  sla: string;
  failover: string;
}

export function InteractiveSandbox() {
  const [activeArchetype, setActiveArchetype] = useState<ArchetypeKey>("fintech");
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ledger-core");
  const [reqCount, setReqCount] = useState(18420);
  const [latency, setLatency] = useState(12.4);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // Live traffic simulation numbers ticker
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setReqCount((prev) => prev + Math.floor(Math.random() * 45) - 20);
      setLatency(Number((11.8 + Math.random() * 1.6).toFixed(1)));
    }, 1200);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const archetypes: Record<
    ArchetypeKey,
    {
      title: string;
      cloudProvider: string;
      description: string;
      nodes: NodeItem[];
      edges: { from: string; to: string; label: string; active?: boolean }[];
      specSnippet: string;
    }
  > = {
    fintech: {
      title: "Fintech Real-Time Ledger & Fraud Check",
      cloudProvider: "Multi-Cloud Enterprise Mesh",
      description:
        "Low-latency transactional banking pipeline with idempotent payment ledger, Redis distributed locks, and automated Kafka fraud evaluation.",
      nodes: [
        {
          id: "edge-gateway",
          label: "Cloudflare Edge Ingress",
          role: "TLS 1.3 Termination & DDoS Shield",
          cloud: "Cloudflare",
          type: "rectangle",
          color: "#1F1F1F",
          textColor: "#EDEDED",
          x: 40,
          y: 110,
          protocol: "HTTPS / HTTP3",
          sla: "99.999% SLA • < 5ms p99",
          failover: "Anycast Global Routing",
        },
        {
          id: "auth-mesh",
          label: "Clerk Auth & IAM Gate",
          role: "JWT Token Validation & mTLS",
          cloud: "Identity Edge",
          type: "pill",
          color: "#10233D",
          textColor: "#52A8FF",
          x: 230,
          y: 40,
          protocol: "mTLS / gRPC",
          sla: "Zero Trust • < 8ms p99",
          failover: "Stateless Edge Replicas",
        },
        {
          id: "ledger-core",
          label: "Idempotent Ledger Engine",
          role: "ACID Financial Balance Mutations",
          cloud: "Kubernetes Cluster",
          type: "pill",
          color: "#062822",
          textColor: "#0AC7B4",
          x: 230,
          y: 190,
          protocol: "gRPC Wire Protocol",
          sla: "Strict Serializability • Zero Drift",
          failover: "Leader-Follower Raft Pods",
        },
        {
          id: "kafka-event",
          label: "Kafka Fraud & Audit Stream",
          role: "Immutable Order Ledger Events",
          cloud: "Apache Kafka",
          type: "hexagon",
          color: "#331B00",
          textColor: "#FF990A",
          x: 440,
          y: 190,
          protocol: "Binary TCP Pub/Sub",
          sla: "Zero Data Loss • ISR=3",
          failover: "5-Broker Multi-AZ Cluster",
        },
        {
          id: "postgres-primary",
          label: "PostgreSQL Primary Cluster",
          role: "Relational Ledger of Record",
          cloud: "Postgres Multi-AZ",
          type: "cylinder",
          color: "#0F2E18",
          textColor: "#62C073",
          x: 230,
          y: 320,
          protocol: "PostgreSQL Wire",
          sla: "RPO = 0 • RTO < 30s",
          failover: "Automated Standby Promotion",
        },
        {
          id: "redis-lock",
          label: "Redis Distributed Lock",
          role: "Idempotency TTL & Rate Token Bucket",
          cloud: "Redis In-Memory",
          type: "cylinder",
          color: "#3C1618",
          textColor: "#FF6166",
          x: 440,
          y: 320,
          protocol: "RESP3 Protocol",
          sla: "< 1ms p99 Read/Write",
          failover: "Redis Sentinel Failover",
        },
      ],
      edges: [
        { from: "edge-gateway", to: "auth-mesh", label: "TLS mTLS", active: true },
        { from: "edge-gateway", to: "ledger-core", label: "gRPC", active: true },
        { from: "ledger-core", to: "kafka-event", label: "Pub/Sub", active: true },
        { from: "ledger-core", to: "postgres-primary", label: "ACID TX", active: true },
        { from: "ledger-core", to: "redis-lock", label: "SETNX", active: true },
      ],
      specSnippet: `## System Architecture: Fintech Real-Time Ledger

### 1. Invariants & Guarantees
- **Idempotency Guarantee**: Every mutating request contains a deterministic \`Idempotency-Key\`. Checked via Redis \`SETNX\` with a 60-second TTL before ledger write.
- **Transactional Consistency**: Order persistence executes inside PostgreSQL serializable transactions.
- **Asynchronous Fanout**: Committed orders emit events to the \`orders.created.v1\` Kafka topic for downstream fulfillment and notification services.

### 2. Failure Recovery
- **Redis Partition**: Ledger falls back to PostgreSQL unique constraint indexes on (tenant_id, idempotency_key).
- **Broker Partition**: Orders are staged to a local transactional outbox table and retried with exponential backoff.`,
    },
    "aws-ecommerce": {
      title: "Amazon AWS E-Commerce Scale Archetype",
      cloudProvider: "Amazon Web Services",
      description:
        "Global high-volume shopping checkout pipeline built on AWS CloudFront, Application Load Balancers, ECS Fargate Microservices, DynamoDB, and SQS DLQ.",
      nodes: [
        {
          id: "aws-route53",
          label: "AWS Route 53 + CloudFront",
          role: "Global CDN & GeoDNS Ingress",
          cloud: "AWS Edge",
          type: "rectangle",
          color: "#1F1F1F",
          textColor: "#EDEDED",
          x: 40,
          y: 110,
          protocol: "HTTPS / HTTP3",
          sla: "99.999% SLA • Global Edge",
          failover: "Multi-Region DNS Failover",
        },
        {
          id: "aws-alb",
          label: "AWS Application Load Balancer",
          role: "L7 Traffic Routing & SSL Offload",
          cloud: "AWS VPC",
          type: "pill",
          color: "#10233D",
          textColor: "#52A8FF",
          x: 230,
          y: 110,
          protocol: "HTTP/2 to Containers",
          sla: "Auto-scaling Target Groups",
          failover: "3 Availability Zones",
        },
        {
          id: "aws-fargate",
          label: "ECS Fargate Microservices",
          role: "Cart, Inventory & Order Containers",
          cloud: "AWS Fargate",
          type: "pill",
          color: "#062822",
          textColor: "#0AC7B4",
          x: 430,
          y: 70,
          protocol: "Internal Private VPC",
          sla: "p99 < 20ms • Zero OS Ops",
          failover: "Auto-Healing Task Replacement",
        },
        {
          id: "aws-sqs",
          label: "Amazon SQS + DLQ",
          role: "Decoupled Asynchronous Queue",
          cloud: "Amazon SQS",
          type: "hexagon",
          color: "#331B00",
          textColor: "#FF990A",
          x: 640,
          y: 70,
          protocol: "SQS Long Polling",
          sla: "Infinite Scale • At-least-once",
          failover: "Dead-Letter Queue Redirection",
        },
        {
          id: "aws-dynamo",
          label: "Amazon DynamoDB Global Table",
          role: "Single-Digit Millisecond NoSQL",
          cloud: "DynamoDB",
          type: "cylinder",
          color: "#0F2E18",
          textColor: "#62C073",
          x: 430,
          y: 270,
          protocol: "AWS IAM SigV4",
          sla: "Sub-10ms Latency • On-Demand",
          failover: "Multi-Region Active-Active",
        },
        {
          id: "aws-elasticache",
          label: "Amazon ElastiCache Redis",
          role: "Sub-millisecond Session Store",
          cloud: "ElastiCache",
          type: "cylinder",
          color: "#3C1618",
          textColor: "#FF6166",
          x: 230,
          y: 270,
          protocol: "Cluster Mode Enabled",
          sla: "p99 < 2ms Read Cache",
          failover: "Multi-AZ Auto-Failover",
        },
      ],
      edges: [
        { from: "aws-route53", to: "aws-alb", label: "HTTPS", active: true },
        { from: "aws-alb", to: "aws-fargate", label: "VPC Private", active: true },
        { from: "aws-fargate", to: "aws-sqs", label: "Enqueue", active: true },
        { from: "aws-fargate", to: "aws-dynamo", label: "PutItem", active: true },
        { from: "aws-alb", to: "aws-elasticache", label: "Session", active: true },
      ],
      specSnippet: `## AWS E-Commerce Architecture Spec

### 1. Ingress & Compute Topology
- **Ingress Layer**: CloudFront edge caches static payloads with WAF bot mitigation rules.
- **Microservices Pods**: Containerized services hosted on AWS Fargate across three availability zones.
- **Queue Buffering**: SQS with FIFO order preservation and dedicated Dead-Letter Queue (DLQ).

### 2. Invariants & Storage
- **DynamoDB**: Global tables replicated across us-east-1 and eu-west-1.
- **Failover SLA**: Automatic instance replacement in under 60 seconds.`,
    },
    "gcp-dataflow": {
      title: "Google Cloud Real-Time Event Dataflow",
      cloudProvider: "Google Cloud Platform",
      description:
        "High-throughput real-time analytical pipeline with Google Cloud Load Balancing, Cloud Run autoscaling workers, Pub/Sub, and BigQuery stream ingestion.",
      nodes: [
        {
          id: "gcp-lb",
          label: "Google Cloud Load Balancing",
          role: "Global Anycast Single IP Ingress",
          cloud: "Google Cloud",
          type: "rectangle",
          color: "#1F1F1F",
          textColor: "#EDEDED",
          x: 40,
          y: 110,
          protocol: "QUIC / HTTP3",
          sla: "100+ PoPs Global Anycast",
          failover: "Instant Cross-Region Overflow",
        },
        {
          id: "gcp-run",
          label: "Google Cloud Run Instances",
          role: "Serverless Event Ingestion Core",
          cloud: "Cloud Run",
          type: "pill",
          color: "#10233D",
          textColor: "#52A8FF",
          x: 230,
          y: 110,
          protocol: "gRPC & HTTP/2",
          sla: "Scale to Zero • Sub-second Cold Start",
          failover: "Multi-Region Cloud Run",
        },
        {
          id: "gcp-pubsub",
          label: "Google Cloud Pub/Sub",
          role: "Globally Distributed Event Bus",
          cloud: "Cloud Pub/Sub",
          type: "hexagon",
          color: "#331B00",
          textColor: "#FF990A",
          x: 440,
          y: 110,
          protocol: "gRPC Streaming Pull",
          sla: "Zero Provisioning • 10M+ msg/s",
          failover: "Cross-continental Redundancy",
        },
        {
          id: "gcp-bigquery",
          label: "BigQuery Streaming Ingestion",
          role: "Petabyte-Scale Analytical Warehouse",
          cloud: "BigQuery",
          type: "cylinder",
          color: "#0F2E18",
          textColor: "#62C073",
          x: 440,
          y: 280,
          protocol: "BigQuery Storage Write API",
          sla: "Real-time Analytical Querying",
          failover: "Managed Bi-Regional Replication",
        },
        {
          id: "gcp-memorystore",
          label: "Memorystore for Redis",
          role: "Real-Time Deduplication Index",
          cloud: "Memorystore",
          type: "cylinder",
          color: "#3C1618",
          textColor: "#FF6166",
          x: 230,
          y: 280,
          protocol: "In-Memory Hash Filter",
          sla: "Sub-millisecond Exact Matching",
          failover: "Automatic Failover Standby",
        },
      ],
      edges: [
        { from: "gcp-lb", to: "gcp-run", label: "HTTPS", active: true },
        { from: "gcp-run", to: "gcp-pubsub", label: "Publish", active: true },
        { from: "gcp-pubsub", to: "gcp-bigquery", label: "Stream API", active: true },
        { from: "gcp-run", to: "gcp-memorystore", label: "Dedup", active: true },
      ],
      specSnippet: `## Google Cloud Dataflow Architecture Spec

### 1. Ingestion Pipeline
- **Global Ingress**: Cloud Load Balancing terminates TCP/SSL at the closest Google edge location.
- **Serverless Worker**: Cloud Run auto-scales to absorb burst traffic up to 50,000 requests/sec.
- **Event Transportation**: Cloud Pub/Sub delivers messages with exactly-once delivery guarantees.

### 2. Analytical Storage
- **BigQuery Write API**: Stream directly into partitioned columnar tables with zero ETL latency.`,
    },
  };

  const current = archetypes[activeArchetype];
  const selectedNode = current.nodes.find((n) => n.id === selectedNodeId) || current.nodes[0];

  const handleCopySpec = () => {
    navigator.clipboard.writeText(current.specSnippet);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <section id="sandbox" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--accent-primary)",
            }}
          >
            <Sliders className="h-3.5 w-3.5" />
            Interactive Architecture Sandbox
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Experience production-grade system design
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Explore real distributed architectures used by industry leaders. Click on any node to
            inspect SLAs and protocols, or toggle live traffic to simulate production loads.
          </p>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {(
            [
              { key: "fintech", label: "Fintech Real-Time Ledger", icon: Shield },
              { key: "aws-ecommerce", label: "Amazon AWS Scale", icon: Server },
              { key: "gcp-dataflow", label: "Google Cloud Dataflow", icon: Zap },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeArchetype === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveArchetype(item.key);
                  setSelectedNodeId(archetypes[item.key].nodes[0].id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[var(--accent-primary)] text-[var(--bg-base)] border-[var(--accent-primary)] shadow-[0_0_20px_rgba(0,200,212,0.3)] scale-102"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-subtle)] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main Interactive Sandbox Board */}
        <div
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          {/* Top Control Bar */}
          <div
            className="flex flex-wrap items-center justify-between p-4 sm:px-6 border-b gap-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
            }}
          >
            {/* Left: Active Archetype Title & Live Status */}
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {current.title}
                </div>
                <div className="text-xs text-[var(--accent-primary)] font-mono">
                  {current.cloudProvider}
                </div>
              </div>
            </div>

            {/* Right: Simulation Controls & Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-4 px-3.5 py-1.5 rounded-xl border text-xs font-mono"
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div>
                  <span className="text-[var(--text-muted)]">Throughput: </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {reqCount.toLocaleString()} req/s
                  </span>
                </div>
                <div className="h-3 w-[1px] bg-[var(--border-default)]" />
                <div>
                  <span className="text-[var(--text-muted)]">p99: </span>
                  <span className="font-bold text-[var(--state-success)]">{latency}ms</span>
                </div>
              </div>

              <Button
                size="sm"
                variant={isSimulating ? "default" : "outline"}
                onClick={() => setIsSimulating(!isSimulating)}
                className="gap-2 rounded-xl text-xs font-semibold"
              >
                {isSimulating ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    Simulating Traffic
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Resume Traffic
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Canvas & Inspector Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-default)]">
            {/* Left: Interactive Canvas Map (Col 8) */}
            <div
              className="lg:col-span-8 p-4 sm:p-6 min-h-[460px] relative overflow-x-auto select-none"
              style={{
                backgroundColor: "var(--bg-base)",
                backgroundImage:
                  "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            >
              {/* Collaborative Presence Badges */}
              <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium shadow-md"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--bg-base)",
                  }}
                >
                  <Radio className="h-3 w-3 animate-ping" />
                  <span>Elena V. (Lead Architect)</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-6 z-20 hidden sm:flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium shadow-md"
                  style={{
                    backgroundColor: "var(--accent-ai)",
                    color: "#ffffff",
                  }}
                >
                  <Cpu className="h-3 w-3" />
                  <span>Ghost AI Copilot: Invariants Verified</span>
                </div>
              </div>

              {/* Interactive Graph Layout Area */}
              <div className="relative min-w-[720px] h-[400px] mx-auto mt-4">
                {/* SVG Connections with Animated Traffic Particles */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <marker
                      id="sb-arrow"
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
                      id="sb-arrow-active"
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

                  {/* Render Connections */}
                  {current.nodes.slice(0, current.nodes.length - 1).map((node, i) => {
                    const nextNode = current.nodes[i + 1];
                    if (!nextNode) return null;
                    const startX = node.x + 80;
                    const startY = node.y + 40;
                    const endX = nextNode.x + 80;
                    const endY = nextNode.y + 40;

                    return (
                      <g key={`${node.id}-${nextNode.id}`}>
                        <path
                          d={`M ${startX} ${startY} C ${startX + 40} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`}
                          stroke={isSimulating ? "var(--accent-primary)" : "var(--border-subtle)"}
                          strokeWidth="2"
                          strokeDasharray={isSimulating ? "6 4" : "none"}
                          fill="none"
                          markerEnd="url(#sb-arrow-active)"
                          className={isSimulating ? "animate-[dash_1s_linear_infinite]" : ""}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Render Interactive Nodes */}
                {current.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="absolute cursor-pointer transition-all duration-150 z-10"
                      style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        width: "175px",
                      }}
                    >
                      <div
                        className={`p-3.5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-[var(--accent-primary)] shadow-[0_0_24px_rgba(0,200,212,0.35)] scale-105"
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
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              color: node.textColor,
                            }}
                          >
                            {node.cloud}
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">
                            {node.type}
                          </span>
                        </div>
                        <div className="text-xs font-bold leading-tight mb-1 truncate">
                          {node.label}
                        </div>
                        <div className="text-[11px] opacity-80 leading-tight line-clamp-2">
                          {node.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instructions banner at bottom */}
              <div className="text-center pt-2 text-xs text-[var(--text-muted)] font-medium">
                💡 Click any node above to inspect its real-time engineering specs and protocols.
              </div>
            </div>

            {/* Right: Live Node Spec Inspector (Col 4) */}
            <div
              className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-6"
              style={{ backgroundColor: "var(--bg-surface)" }}
            >
              <div>
                <div className="flex items-center justify-between border-b pb-3 mb-5 border-[var(--border-default)]">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-muted)]">
                      Component Spec Inspector
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: "rgba(0, 200, 212, 0.12)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    Active Node
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {selectedNode.role}
                    </p>
                  </div>

                  {/* Attribute list */}
                  <div
                    className="p-4 rounded-xl border space-y-3 font-mono text-xs"
                    style={{
                      backgroundColor: "var(--bg-base)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)]">
                        Transport Protocol
                      </div>
                      <div className="text-[var(--text-primary)] font-semibold mt-0.5">
                        {selectedNode.protocol}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)]">
                        Target SLA & Latency
                      </div>
                      <div className="text-[var(--state-success)] font-semibold mt-0.5">
                        {selectedNode.sla}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)]">
                        High Availability / Failover
                      </div>
                      <div className="text-[var(--text-secondary)] font-semibold mt-0.5">
                        {selectedNode.failover}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)]">
                        Geometric Topology Shape
                      </div>
                      <div className="text-[var(--accent-ai-text)] capitalize mt-0.5">
                        {selectedNode.type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Spec Copy Button */}
              <div
                className="pt-4 border-t space-y-3"
                style={{ borderColor: "var(--border-default)" }}
              >
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Exportable Technical Spec</span>
                  <span className="font-mono text-[var(--accent-primary)]">spec.md</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySpec}
                  className="w-full gap-2 rounded-xl text-xs font-semibold justify-center"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedSpec ? "Specification Copied!" : "Copy Full Markdown Spec"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
