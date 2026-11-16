"use client";

import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, FileCheck, ArrowRight, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacyPreviewSection() {
  const commitments = [
    {
      icon: EyeOff,
      title: "Zero Model Training",
      description:
        "We never train AI foundation models on your private canvas graphs, node labels, or system prompts. Your architectural intellectual property remains strictly yours.",
    },
    {
      icon: Lock,
      title: "Strict Workspace Isolation",
      description:
        "Authentication is protected by Clerk. Access to projects, rooms, and collaborators is verified on every mutation and Liveblocks token issuance.",
    },
    {
      icon: Database,
      title: "Encrypted Cloud Storage",
      description:
        "Canvas snapshots and generated Markdown specifications are securely stored in Vercel Blob with HTTPS encryption in transit and at rest.",
    },
    {
      icon: FileCheck,
      title: "Data Portability & Purge",
      description:
        "Export your technical specifications to standard Markdown anytime. When you delete a project, its metadata, room, and associated artifacts are permanently deleted.",
    },
  ];

  return (
    <section id="privacy" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{
              backgroundColor: "rgba(52, 211, 153, 0.15)",
              color: "var(--state-success)",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy & Trust
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Your system architecture is confidential
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Infrastructure topology reveals the core engineering DNA of your company.
            Ghost AI is engineered from day one with privacy-first boundaries.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {commitments.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="p-6 sm:p-8 rounded-2xl border flex flex-col justify-between"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div>
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                    style={{
                      backgroundColor: "rgba(52, 211, 153, 0.12)",
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "var(--state-success)" }} />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2 tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {c.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout Card linking to /privacy */}
        <div
          className="p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Need comprehensive compliance and legal details?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Read our complete Privacy Policy including data retention periods, GDPR/CCPA rights, and third-party sub-processors.
            </p>
          </div>
          <Link href="/privacy" className="flex-shrink-0">
            <Button
              variant="outline"
              className="gap-2 rounded-xl text-xs sm:text-sm font-semibold"
              style={{
                borderColor: "var(--border-default)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
              }}
            >
              Read Full Privacy Policy
              <ArrowRight className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
