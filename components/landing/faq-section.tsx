"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Ghost AI train public AI models on our proprietary architecture designs?",
      a: "Never. We enforce a strict zero foundation model training policy. Your architecture graphs, node labels, team prompts, and technical specifications are processed solely in isolated ephemeral runtime contexts and are never used to train or improve public foundation models.",
    },
    {
      q: "How does real-time multiplayer collaboration work?",
      a: "Our canvas is built on Liveblocks WebSockets and React Flow. Collaborators can concurrently drag nodes, adjust connections, and view each other's cursor positions and selection states with sub-millisecond latency. Token verification happens on every connection.",
    },
    {
      q: "Can we export the generated technical specifications to our internal wikis or Git?",
      a: "Yes. Technical specifications are synthesized directly into standard GitHub-flavored Markdown (.md). You can copy the spec directly, download the raw markdown file, or store it in your repositories alongside your pull requests and RFCs.",
    },
    {
      q: "What starter templates are included with Ghost AI?",
      a: "Ghost AI includes battle-tested architecture archetypes out of the box: Event-Driven CQRS (Kafka + Postgres + Redis), Distributed Microservices Mesh (Envoy + mTLS), Serverless Edge Pipelines (Cloudflare Workers + Neon), and Monoliths with Edge Caching.",
    },
    {
      q: "How are project access and collaborator roles managed?",
      a: "Authentication and route protection are handled via Clerk. Projects feature owner-level controls and collaborator invitation mechanisms. Every API mutation and Liveblocks room token issuance enforces strict server-side authorization checks.",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--accent-primary)",
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Engineering & Enterprise FAQs
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Everything you need to know about Ghost AI collaboration, data security, and specs.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: isOpen ? "var(--border-subtle)" : "var(--border-default)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span
                    className="text-base font-bold tracking-tight pr-4"
                    style={{ color: isOpen ? "var(--accent-primary)" : "var(--text-primary)" }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm leading-relaxed border-t pt-4"
                    style={{
                      borderColor: "var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
