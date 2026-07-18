"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRound, Link2, X, Plus, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Collaborator {
  id: string;
  projectId: string;
  email: string;
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

// ─── Avatar ──────────────────────────────────────────────────────────────────

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
        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
      style={{
        backgroundColor: "var(--bg-subtle)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {initials || <UserRound className="h-4 w-4" />}
    </div>
  );
}

// ─── ShareDialog ─────────────────────────────────────────────────────────────

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
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Fetch collaborators ──────────────────────────────────────────────────
  const fetchCollaborators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open, fetchCollaborators]);

  // ── Invite ───────────────────────────────────────────────────────────────
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
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
      setInviteEmail("");
    } finally {
      setInviting(false);
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
        className="sm:max-w-md rounded-3xl p-0 gap-0 overflow-hidden"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <DialogTitle
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Share Project
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Invite form — owners only */}
          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2">
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Invite by email
              </p>
              <div className="flex gap-2">
                <Input
                  id="share-dialog-invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  disabled={inviting}
                  className="flex-1 h-9 rounded-xl text-sm"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: inviteError
                      ? "var(--state-error)"
                      : "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={inviting || !inviteEmail.trim()}
                  className="h-9 px-3 rounded-xl gap-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#000",
                  }}
                >
                  {inviting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Invite
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs" style={{ color: "var(--state-error)" }}>
                  {inviteError}
                </p>
              )}
            </form>
          )}

          {/* Collaborator list */}
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {collaborators.length === 0 && !loading
                ? "No collaborators yet"
                : "Collaborators"}
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {collaborators.map((collab) => (
                  <li
                    key={collab.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 group"
                    style={{ backgroundColor: "var(--bg-subtle)" }}
                  >
                    <CollaboratorAvatar
                      avatarUrl={collab.avatarUrl}
                      displayName={collab.displayName}
                      email={collab.email}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      {collab.displayName && (
                        <span
                          className="text-sm font-medium truncate leading-tight"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {collab.displayName}
                        </span>
                      )}
                      <span
                        className="text-xs truncate leading-tight"
                        style={{
                          color: collab.displayName
                            ? "var(--text-muted)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {collab.email}
                      </span>
                    </div>

                    {/* Remove button — owner only */}
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${collab.email}`}
                        disabled={removingId === collab.id}
                        onClick={() => handleRemove(collab.id)}
                        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ color: "var(--state-error)" }}
                      >
                        {removingId === collab.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Copy link */}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Link2
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
              <span
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}/editor/${projectId}`
                  : `/editor/${projectId}`}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              id="share-dialog-copy-link"
              className="h-7 px-2.5 rounded-lg text-xs font-medium flex-shrink-0 gap-1.5 ml-2"
              style={{
                color: copied ? "var(--state-success)" : "var(--text-secondary)",
                backgroundColor: copied
                  ? "rgba(52, 211, 153, 0.1)"
                  : "transparent",
                transition: "color 0.2s, background-color 0.2s",
              }}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                "Copy"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
