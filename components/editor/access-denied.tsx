import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div
        className="flex flex-col items-center gap-6 p-10 max-w-sm w-full text-center rounded-3xl border backdrop-blur-md"
        style={{
          backgroundColor: "rgba(24, 24, 28, 0.65)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Lock icon */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl border"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <Lock
            className="h-8 w-8"
            style={{ color: "var(--state-error)" }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Access Denied
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This project doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/editor"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--accent-primary)" }}
        >
          ← Back to Editor
        </Link>
      </div>
    </div>
  );
}
