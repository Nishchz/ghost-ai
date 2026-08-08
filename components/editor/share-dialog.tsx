"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserRound,
  Link2,
  X,
  Plus,
  Loader2,
  Check,
  Mail,
  CheckCircle2,
  Send,
  Users,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Collaborator {
  id: string;
  projectId: string;
  email: string;
  status?: "PENDING" | "ACCEPTED";
  createdAt: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ShareDialogProps {
  open: boolean;
  projectId: string;
  isOwner: boolean;
  onClose: () => void;
}

// ─── Avatar Component ────────────────────────────────────────────────────────

function CollaboratorAvatar({
  avatarUrl,
  displayName,
  email,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  email: string;
}) {
  const initials = (displayName ?? email)
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName ?? email}
        className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-white/10"
      />
    );
  }

  return (
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {initials || <UserRound className="h-4 w-4" />}
    </div>
  );
}

// ─── ShareDialog Component ───────────────────────────────────────────────────

export function ShareDialog({
  open,
  projectId,
  isOwner,
  onClose,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Fetch collaborators ──────────────────────────────────────────────────
  const fetchCollaborators = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators ?? []);
      }
      // On non-ok (e.g. 500 P1017), silently keep existing data — next poll will retry
    } catch {
      // Network error — keep existing data, next poll will retry
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [projectId]);

  // ── Auto-fetch on open + poll every 10 s to catch PENDING→ACCEPTED ────────
  useEffect(() => {
    if (!open) return;
    fetchCollaborators(true);   // show spinner on initial open
    const interval = setInterval(() => fetchCollaborators(false), 10_000); // silent poll
    return () => clearInterval(interval);
  }, [open, fetchCollaborators]);


  // ── Invite ───────────────────────────────────────────────────────────────
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    const email = inviteEmail.trim();
    if (!email) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to invite collaborator.");
        return;
      }

      setCollaborators((prev) => [...prev, data as Collaborator]);
      setInviteSuccess(
        data.emailSimulated
          ? `Invitation sent to ${email} (Dev terminal mode)`
          : `Invitation email dispatched to ${email}`
      );
      setInviteEmail("");
      setTimeout(() => setInviteSuccess(null), 5000);
    } finally {
      setInviting(false);
    }
  }

  // ── Resend ───────────────────────────────────────────────────────────────
  async function handleResend(collaboratorId: string, email: string) {
    setResendingId(collaboratorId);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteSuccess(`Invitation resent to ${email}`);
        setTimeout(() => setInviteSuccess(null), 4000);
      } else {
        setInviteError(data.error ?? "Failed to resend invitation.");
      }
    } finally {
      setResendingId(null);
    }
  }

  // ── Remove ───────────────────────────────────────────────────────────────
  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      }
    } finally {
      setRemovingId(null);
    }
  }

  // ── Copy link ────────────────────────────────────────────────────────────
  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="w-full max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden shadow-2xl backdrop-blur-xl border border-white/10"
        style={{
          backgroundColor: "rgba(17, 17, 20, 0.95)",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 flex flex-col gap-1.5"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-2 pr-6">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(98, 192, 115, 0.15)",
                color: "#62C073",
                border: "1px solid rgba(98, 192, 115, 0.3)",
              }}
            >
              <Users className="h-4 w-4" />
            </div>
            <DialogTitle
              className="text-base font-semibold tracking-tight leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              Share Architecture Project
            </DialogTitle>
          </div>
          <DialogDescription
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Invite collaborators to build and edit system design graphs together in real time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 min-w-0 overflow-hidden">
          {/* Invite form — owners only */}
          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2 w-full min-w-0">
              <label
                htmlFor="share-dialog-invite-email"
                className="text-xs font-medium flex flex-wrap items-center justify-between gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>Invite by Email</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">
                  Real-time notification enabled
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
                <Input
                  id="share-dialog-invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  disabled={inviting}
                  className="w-full sm:flex-1 min-w-0 h-10 rounded-xl text-sm transition-all focus:ring-1 focus:ring-emerald-500/50"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    borderColor: inviteError
                      ? "var(--state-error)"
                      : "rgba(255, 255, 255, 0.12)",
                    color: "var(--text-primary)",
                  }}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl gap-2 text-xs font-semibold shadow-lg transition-transform active:scale-95 shrink-0 justify-center"
                  style={{
                    backgroundColor: "#62C073",
                    color: "#080809",
                  }}
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Invite
                </Button>
              </div>

              {inviteError && (
                <div
                  className="rounded-lg px-3 py-2 text-xs flex items-center gap-2 border break-words"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                    color: "#f87171",
                  }}
                >
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div
                  className="rounded-lg px-3 py-2 text-xs flex items-center gap-2 border break-words"
                  style={{
                    backgroundColor: "rgba(98, 192, 115, 0.12)",
                    borderColor: "rgba(98, 192, 115, 0.3)",
                    color: "#62C073",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-words">{inviteSuccess}</span>
                </div>
              )}
            </form>
          )}

          {/* Collaborator list */}
          <div className="flex flex-col gap-2.5 w-full min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-xs font-semibold tracking-wider uppercase truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Project Collaborators
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Refresh collaborator status"
                  onClick={() => fetchCollaborators(true)}
                  className="h-5 w-5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 shrink-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                {collaborators.length} member{collaborators.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="h-5 w-5 animate-spin text-emerald-400"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5 min-w-0">
                {collaborators.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed text-center gap-1.5"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    <Mail className="h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-400">
                      No collaborators added yet. Send an email invitation above!
                    </p>
                  </div>
                ) : (
                  collaborators.map((collab) => {
                    const isAccepted = collab.status === "ACCEPTED";
                    return (
                      <div
                        key={collab.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-xl p-2.5 transition-colors group border w-full min-w-0"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          borderColor: "rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                          <CollaboratorAvatar
                            avatarUrl={collab.avatarUrl}
                            displayName={collab.displayName}
                            email={collab.email}
                          />
                          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                            <span
                              className="text-xs sm:text-sm font-medium truncate leading-tight block w-full"
                              style={{ color: "var(--text-primary)" }}
                              title={collab.displayName || collab.email}
                            >
                              {collab.displayName || collab.email}
                            </span>
                            {collab.displayName && (
                              <span
                                className="text-[11px] truncate leading-tight mt-0.5 block w-full"
                                style={{ color: "var(--text-muted)" }}
                                title={collab.email}
                              >
                                {collab.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              Accepted
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                <Clock className="h-3 w-3 animate-pulse text-amber-400" />
                                Pending
                              </span>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Resend email invitation"
                                  disabled={resendingId === collab.id}
                                  onClick={() => handleResend(collab.id, collab.email)}
                                  className="h-7 px-2 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/10 shrink-0"
                                >
                                  {resendingId === collab.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Remove button — owner only */}
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${collab.email}`}
                              disabled={removingId === collab.id}
                              onClick={() => handleRemove(collab.id)}
                              className="h-7 w-7 rounded-lg opacity-80 hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all shrink-0 ml-auto sm:ml-0"
                            >
                              {removingId === collab.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Copy link section */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl p-3 sm:px-3.5 sm:py-2.5 border w-full min-w-0 overflow-hidden"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <Link2
                className="h-4 w-4 shrink-0 text-emerald-400"
              />
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="text-[10px] text-zinc-400 font-medium">Direct Workspace Link</span>
                <span
                  className="text-xs truncate font-mono text-zinc-300 block w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  title={typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : `/editor/${projectId}`}
                >
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/editor/${projectId}`
                    : `/editor/${projectId}`}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              id="share-dialog-copy-link"
              className="w-full sm:w-auto h-8 px-3 rounded-lg text-xs font-semibold shrink-0 gap-1.5 border transition-all justify-center"
              style={{
                color: copied ? "#62C073" : "var(--text-secondary)",
                backgroundColor: copied ? "rgba(98, 192, 115, 0.15)" : "rgba(255, 255, 255, 0.05)",
                borderColor: copied ? "rgba(98, 192, 115, 0.3)" : "rgba(255, 255, 255, 0.1)",
              }}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                "Copy Link"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
