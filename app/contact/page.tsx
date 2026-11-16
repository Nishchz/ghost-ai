"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowLeft,
  Building2,
  ShieldCheck,
  Server,
  Terminal,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "20-100",
    cloud: "aws",
    topic: "enterprise",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
    }, 700);
  };

  const handleReset = () => {
    setFormState({
      name: "",
      email: "",
      company: "",
      teamSize: "20-100",
      cloud: "aws",
      topic: "enterprise",
      message: "",
    });
    setStatus("idle");
  };

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

          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl text-xs sm:text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--accent-primary)",
            }}
          >
            <Mail className="h-3.5 w-3.5" />
            Direct Systems Consultation
          </div>
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Connect with our Systems Engineering Team
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Explore enterprise workspaces, discuss custom template architectures, or schedule an
            interactive technical consultation for your infrastructure leads.
          </p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* Left: Enterprise Inquiry Form */}
          <div
            className="lg:col-span-7 p-6 sm:p-10 rounded-3xl border shadow-2xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            {status === "success" ? (
              <div className="py-12 text-center space-y-4">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                    border: "1px solid var(--state-success)",
                  }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: "var(--state-success)" }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Consultation Request Received!
                </h3>
                <p
                  className="text-sm max-w-md mx-auto leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Thank you,{" "}
                  <span className="font-semibold text-[var(--accent-primary)]">
                    {formState.name}
                  </span>
                  . A senior systems architect from Ghost AI will review your requirements and reach
                  out at{" "}
                  <span className="font-mono text-xs text-[var(--text-primary)]">
                    {formState.email}
                  </span>{" "}
                  within 4 hours.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-xl text-sm"
                    style={{
                      borderColor: "var(--border-default)",
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Enterprise Consultation Request
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Direct access to our engineering leads. No sales runarounds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Full Name *
                    </label>
                    <Input
                      id="contact-name"
                      required
                      placeholder="e.g. Maya Chen"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Work Email *
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="maya@enterprise.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-company"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Company / Organization
                    </label>
                    <Input
                      id="contact-company"
                      placeholder="e.g. Acme Cloud Corp"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-team"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Engineering Team Size
                    </label>
                    <select
                      id="contact-team"
                      value={formState.teamSize}
                      onChange={(e) => setFormState({ ...formState, teamSize: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl text-sm border font-sans focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      style={{
                        backgroundColor: "var(--bg-base)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="1-10">1 – 10 engineers</option>
                      <option value="10-50">10 – 50 engineers</option>
                      <option value="50-250">50 – 250 engineers</option>
                      <option value="250+">250+ engineers (Global Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-cloud"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Primary Cloud Stack
                    </label>
                    <select
                      id="contact-cloud"
                      value={formState.cloud}
                      onChange={(e) => setFormState({ ...formState, cloud: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl text-sm border font-sans focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      style={{
                        backgroundColor: "var(--bg-base)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="aws">Amazon Web Services (AWS)</option>
                      <option value="gcp">Google Cloud Platform (GCP)</option>
                      <option value="azure">Microsoft Azure</option>
                      <option value="multi">Multi-Cloud / Hybrid</option>
                      <option value="on-prem">Bare Metal / Kubernetes On-Prem</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-topic"
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Inquiry Focus
                    </label>
                    <select
                      id="contact-topic"
                      value={formState.topic}
                      onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl text-sm border font-sans focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      style={{
                        backgroundColor: "var(--bg-base)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="enterprise">Enterprise Team Workspace</option>
                      <option value="consultation">Architecture Consultation & Review</option>
                      <option value="templates">Custom System Design Templates</option>
                      <option value="security">Security & Compliance Review</option>
                      <option value="feedback">Product Feedback & Integration</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    System Context & Goals *
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Tell us about the systems you are designing (e.g. scale targets, microservices migration, live multiplayer needs)..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl gap-2 font-semibold text-sm"
                >
                  {status === "submitting" ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Request Architecture Consultation
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right: Channels & Guarantees */}
          <div className="lg:col-span-5 space-y-5">
            {/* SLA Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                  }}
                >
                  <Clock className="h-5 w-5 text-[var(--state-success)]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                    Priority Response SLA
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    Engineering consultations and technical inquiries receive dedicated responses
                    from senior systems architects within <strong className="text-[var(--text-primary)]">4 business hours</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Channel Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "var(--accent-primary-dim)",
                  }}
                >
                  <Mail className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                    Direct Email Channels
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm font-mono mt-2">
                    <div>
                      <span className="text-[var(--text-muted)]">Enterprise: </span>
                      <a href="mailto:enterprise@ghostai.dev" className="text-[var(--accent-primary)] hover:underline">
                        enterprise@ghostai.dev
                      </a>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Engineering: </span>
                      <a href="mailto:support@ghostai.dev" className="text-[var(--accent-primary)] hover:underline">
                        support@ghostai.dev
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Consultation Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(100, 87, 249, 0.15)",
                  }}
                >
                  <ShieldCheck className="h-5 w-5 text-[var(--accent-ai-text)]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                    Security & Compliance Reviews
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    Need SOC2 documentation, custom data residency, or vendor risk assessments?
                    Contact our dedicated compliance team directly at{" "}
                    <span className="font-mono text-[var(--accent-ai-text)]">security@ghostai.dev</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
