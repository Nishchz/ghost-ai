import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left panel — visible on large screens only */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        <div className="max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Ghost
            </span>
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--accent-primary)" }}
            >
              {" "}
              AI
            </span>
          </div>

          {/* Tagline */}
          <p
            className="text-2xl font-medium leading-snug mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Design systems,
            <br />
            not documents.
          </p>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              "Collaborative real-time canvas",
              "AI-powered architecture generation",
              "Instant technical spec export",
              "Version-controlled system designs",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <span
                  className="inline-block h-1 w-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — Clerk form */}
      <div
        className="flex flex-1 items-center justify-center p-6"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <SignIn />
      </div>
    </main>
  );
}
