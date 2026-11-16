"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Building,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "feedback",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setStatus("submitting");
    // Simulate lightweight client submission
    setTimeout(() => {
      setStatus("success");
    }, 800);
  };

  const handleReset = () => {
    setFormState({
      name: "",
      email: "",
      subject: "feedback",
      message: "",
    });
    setStatus("idle");
  };

  return (
    <section id="contact" className="py-20 md:py-28 relative">
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
            <Mail className="h-3.5 w-3.5" />
            Contact & Support
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Let&apos;s build better systems together
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Have feedback on canvas nodes? Want to discuss custom templates or team collaboration?
            Reach out directly and our engineering team will respond promptly.
          </p>
        </div>

        {/* Form and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Form */}
          <div
            className="lg:col-span-7 p-6 sm:p-10 rounded-3xl border shadow-xl"
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
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Message Sent Successfully!
                </h3>
                <p
                  className="text-sm max-w-md mx-auto leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Thank you for contacting Ghost AI,{" "}
                  <span className="font-semibold text-[var(--accent-primary)]">
                    {formState.name}
                  </span>
                  . Our team has received your message and will get back to you at{" "}
                  <span className="font-mono text-xs text-[var(--text-primary)]">
                    {formState.email}
                  </span>{" "}
                  within 24 hours.
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
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Send us a message
                  </h3>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                    Fill out the form below and we will get back to you shortly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your Name
                    </label>
                    <Input
                      id="contact-name"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Work Email
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-subject"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl text-sm border font-sans focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    style={{
                      backgroundColor: "var(--bg-base)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="feedback">Product Feedback & Feature Request</option>
                    <option value="templates">Starter Templates & System Archetypes</option>
                    <option value="team">Team Collaboration & Permissions</option>
                    <option value="bug">Bug Report / Technical Issue</option>
                    <option value="other">General Question</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Tell us what you are working on or how we can help..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl gap-2 font-medium"
                >
                  {status === "submitting" ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Information Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "var(--accent-primary-dim)",
                  }}
                >
                  <Mail className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    Direct Email
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    For direct inquiries, technical partnership, or security reports.
                  </p>
                  <a
                    href="mailto:support@ghostai.dev"
                    className="text-xs font-mono font-medium hover:underline"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    support@ghostai.dev
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                  }}
                >
                  <Clock className="h-5 w-5" style={{ color: "var(--state-success)" }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    Fast Response Guarantee
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    We review messages constantly. Engineering and architecture questions
                    receive detailed replies within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Community & GitHub Card */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                  }}
                >
                  <GitBranch className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    Community & Issues
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                    Track updates, suggest templates, and contribute to the system design catalog.
                  </p>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    github.com/ghost-ai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
