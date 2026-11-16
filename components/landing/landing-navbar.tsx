"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, Menu, X, Sparkles, Layers, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

export function LandingNavbar({ isAuthenticated = false }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Interactive Sandbox", href: "/#sandbox" },
    { label: "Architecture", href: "/#architecture" },
    { label: "About Us", href: "/about" },
    { label: "Contact & Sales", href: "/contact" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl transition-colors"
      style={{
        backgroundColor: "rgba(11, 11, 14, 0.82)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,200,212,0.3)]"
            style={{
              backgroundColor: "var(--accent-primary-dim)",
              border: "1px solid var(--accent-primary)",
            }}
          >
            <Layers className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
          </div>
          <div className="flex items-center">
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              ghost
            </span>
            <span
              className="text-lg font-bold tracking-tight ml-1.5"
              style={{ color: "var(--accent-primary)" }}
            >
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/editor">
                <Button size="sm" className="gap-2 rounded-xl font-semibold shadow-md">
                  Open Workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center pl-1">
                <UserButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="gap-1.5 rounded-xl font-semibold shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start Free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && (
            <div className="mr-1">
              <UserButton />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-xl"
            style={{ color: "var(--text-primary)" }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-b px-4 pt-3 pb-6 space-y-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Privacy & Trust
            </Link>
          </div>

          <div
            className="pt-3 border-t flex flex-col gap-2.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {isAuthenticated ? (
              <Link href="/editor" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2 rounded-xl justify-center font-semibold">
                  Open Workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl justify-center"
                    style={{
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-elevated)",
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-1.5 rounded-xl justify-center font-semibold">
                    <Sparkles className="h-4 w-4" />
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
