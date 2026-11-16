"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, Shield, Zap, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasPreview } from "@/components/landing/canvas-preview";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background ambient glow effect */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-[140px] opacity-25 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-primary) 0%, var(--accent-ai) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium border backdrop-blur-md transition-transform hover:scale-102"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <span
              className="flex h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span style={{ color: "var(--accent-primary)" }} className="font-semibold">
              Ghost AI 1.0
            </span>
            <span className="text-[var(--border-subtle)]">•</span>
            <span>Real-time collaborative system design & spec engine</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Design distributed systems at the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent-primary) 0%, #ffffff 50%, var(--accent-ai-text) 100%)",
              }}
            >
              speed of thought.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto font-normal"
            style={{ color: "var(--text-secondary)" }}
          >
            Describe your architecture in plain English. Ghost AI maps nodes and edges onto a live
            multiplayer canvas with your team, then converts your verified graph into production-ready
            technical specifications.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link href={isAuthenticated ? "/editor" : "/sign-up"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                {isAuthenticated ? "Launch Workspace" : "Start Designing Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="#sandbox" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 py-6 text-base font-medium rounded-xl gap-2"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                <Terminal className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                Live Interactive Sandbox
              </Button>
            </Link>
          </div>

          {/* Technical Invariants Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-[var(--text-muted)] mb-12">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
              <span>Multiplayer Sync via Liveblocks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent-ai-text)" }} />
              <span>Natural Language to React Flow Graph</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-4 w-4" style={{ color: "var(--state-success)" }} />
              <span>1-Click Markdown Spec Generation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
              <span>Zero Model Training on Customer Data</span>
            </div>
          </div>
        </div>

        {/* Canvas Interactive Mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div
            className="absolute -inset-1 rounded-3xl opacity-30 blur-xl pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, var(--accent-primary-dim) 0%, rgba(100, 87, 249, 0.15) 100%)",
            }}
          />
          <CanvasPreview />
        </div>
      </div>
    </section>
  );
}
