"use client";

import {
  Boxes,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  Workflow,
  Zap,
} from "lucide-react";

export function TechEcosystem() {
  const stack = [
    { name: "Kubernetes", category: "Container Orchestration" },
    { name: "Apache Kafka", category: "Event Streaming" },
    { name: "PostgreSQL", category: "Relational ACID DB" },
    { name: "Redis", category: "Distributed Cache" },
    { name: "Envoy Proxy", category: "Service Mesh" },
    { name: "gRPC & HTTP/3", category: "Transport Protocol" },
    { name: "Cloudflare Workers", category: "Edge Compute" },
    { name: "Amazon DynamoDB", category: "NoSQL KV Store" },
    { name: "Google BigQuery", category: "Analytical Storage" },
  ];

  return (
    <section className="py-12 border-y relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p
            className="text-xs uppercase font-mono font-semibold tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Built for modern infrastructure stacks & cloud ecosystems
          </p>
        </div>

        {/* Ecosystem Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {stack.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center transition-all duration-200 hover:border-[var(--border-subtle)] hover:scale-102"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border-default)",
              }}
            >
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-0.5">
                {item.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-muted)]">
                {item.category}
              </span>
            </div>
          ))}
          {/* 10th card: Ghost AI engine */}
          <div
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center"
            style={{
              backgroundColor: "var(--accent-primary-dim)",
              borderColor: "var(--accent-primary)",
            }}
          >
            <span className="text-xs sm:text-sm font-bold text-[var(--accent-primary)] mb-0.5">
              + Custom Nodes
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-primary)]">
              Any Custom Runtime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
