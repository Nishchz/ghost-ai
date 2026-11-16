import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Database, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | ghost AI",
  description: "Privacy Policy and data protection standards for the Ghost AI collaborative system design workspace.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 16, 2026";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Header */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b px-4 sm:px-8 py-3.5"
        style={{
          backgroundColor: "rgba(17, 17, 20, 0.85)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              ghost
            </span>
            <span className="text-lg font-bold tracking-tight text-[var(--accent-primary)]">
              AI
            </span>
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
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Title Header */}
        <div className="border-b pb-8 mb-10 border-[var(--border-default)]">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: "rgba(52, 211, 153, 0.15)",
              color: "var(--state-success)",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Legal & Data Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-[var(--text-muted)]">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Quick Highlights Summary Box */}
        <div
          className="p-6 sm:p-8 rounded-2xl border mb-12 space-y-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--accent-primary)]" />
            Executive Privacy Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--state-success)] flex-shrink-0 mt-0.5" />
              <span>We never sell or broker your personal or company data.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--state-success)] flex-shrink-0 mt-0.5" />
              <span>We never train public AI models on your system designs or prompts.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--state-success)] flex-shrink-0 mt-0.5" />
              <span>Authentication and user identities are protected via Clerk.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--state-success)] flex-shrink-0 mt-0.5" />
              <span>You retain complete ownership of all generated specifications and graphs.</span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              1. Overview and Scope
            </h2>
            <p>
              This Privacy Policy explains how Ghost AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
              collects, uses, and safeguards information when you access our collaborative system design
              workspace, website, and related APIs (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              We believe system design diagrams and technical specifications represent the critical intellectual
              property of engineering organizations. Our platform is built from the ground up with data
              isolation, security invariants, and privacy-first principles.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              2. Information We Collect
            </h2>
            <p>We collect information in the following categories:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Account & Identity Information:</strong>{" "}
                When you create an account or sign in, identity data (such as your email address, name,
                and user profile image) is managed securely via Clerk. We store your Clerk user identifier
                to link your projects and access rights.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Project & Architecture Metadata:</strong>{" "}
                Project titles, room IDs, timestamps, and collaborator lists are stored in our PostgreSQL
                database via Prisma.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Canvas Graphs & Snapshots:</strong>{" "}
                Node schemas, shapes, labels, edges, and connection topologies created by you or your
                collaborators. These are stored in persistent object storage (Vercel Blob) as JSON documents.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">AI Prompts & Generated Specs:</strong>{" "}
                Natural language descriptions you submit to generate architectures, along with the
                resulting Markdown technical specifications.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              3. AI Architecture Generation & Zero-Training Policy
            </h2>
            <p>
              When you prompt Ghost AI to generate an architecture, your prompt and current canvas context
              are processed solely for the purpose of executing your requested generation task.
            </p>
            <div
              className="p-4 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm font-mono"
              style={{ backgroundColor: "var(--bg-surface)" }}
            >
              <strong className="text-[var(--accent-primary)] block mb-1">
                Zero Foundation Model Training Commitment:
              </strong>
              We do not use customer system design graphs, node labels, architectural topologies, or user
              prompts to train, retrain, fine-tune, or improve public machine learning foundation models.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              4. Real-Time Multiplayer Collaboration (Liveblocks)
            </h2>
            <p>
              Our real-time canvas utilizes Liveblocks to provide multiplayer presence, cursor tracking,
              and synchronized node mutations.
            </p>
            <p>
              Ephemeral state—such as cursor coordinates (x, y), thinking indicators, and selection
              highlights—is broadcast transiently in-memory and is not permanently logged or retained after
              all collaborators leave the active session.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              5. Data Storage and Security
            </h2>
            <p>
              We implement industry-standard technical measures to safeguard your information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Encryption:</strong> All data in transit
                is encrypted via TLS 1.3. Persistent artifacts in Vercel Blob and PostgreSQL are encrypted at rest.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Access Control:</strong> Project mutations,
                collaborator invitations, and Liveblocks room tokens are guarded by server-side verification
                checks enforcing project ownership or explicit collaborator grants.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Boundary Separation:</strong> Large artifacts
                (snapshots and specs) are isolated from operational database metadata to maintain clean
                containment boundaries.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              6. Data Ownership, Portability & Deletion
            </h2>
            <p>
              You maintain 100% ownership of your architecture diagrams, custom node definitions, and
              generated technical specifications.
            </p>
            <p>
              You may download or export your Markdown technical specs at any time. When you delete a
              project from your dashboard, all database records, collaborator relationships, Liveblocks
              rooms, and stored blob artifacts are permanently purged from our active systems.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              7. Third-Party Infrastructure Providers
            </h2>
            <p>We work with trusted cloud infrastructure providers to operate the service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Clerk:</strong> User authentication, session management, and route protection.</li>
              <li><strong>Liveblocks:</strong> Real-time WebSocket synchronization and presence.</li>
              <li><strong>Vercel Blob:</strong> Secure artifact storage for canvas graphs and specs.</li>
              <li><strong>Prisma & PostgreSQL:</strong> Metadata persistence and access relationships.</li>
              <li><strong>Trigger.dev:</strong> Durable asynchronous background task execution.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              8. Contact & Privacy Inquiries
            </h2>
            <p>
              If you have any questions about this Privacy Policy, wish to exercise your data rights, or
              request account deletion, please contact our team at:
            </p>
            <div
              className="p-4 rounded-xl border border-[var(--border-subtle)] font-mono text-sm"
              style={{ backgroundColor: "var(--bg-surface)" }}
            >
              <div>Email: <a href="mailto:privacy@ghostai.dev" className="text-[var(--accent-primary)] hover:underline">privacy@ghostai.dev</a></div>
              <div>Team: Ghost AI Security & Compliance Team</div>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-[var(--border-default)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Ghost AI Home
          </Link>
          <span>© 2026 Ghost AI</span>
        </div>
      </main>
    </div>
  );
}
