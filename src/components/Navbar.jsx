"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Menu, X, ChevronDown, LogOut, User, BookOpen } from "lucide-react";

const Navbar = () => {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Public links (visible to everyone)
  const publicLinks = [
    { href: "/plans", label: "All Plans" },
  ];

  // Anchor links for landing page (only show when not logged in)
  const landingLinks = [
    { href: "/#about", label: "About" },
    { href: "/#features", label: "Features" },
  ];

  // Auth user links (only visible when logged in)
  const authLinks = [
    { href: "/instances", label: "My Instances" },
    { href: "/my-plans", label: "My Study Plans" },
  ];

  // Helper to determine if link is active
  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight"
            >
              <BookOpen className="h-6 w-6" />
              <span>Study Sync</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {/* Public links - always visible */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Landing page anchor links - only when not logged in */}
            {!user && landingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth user links - only when logged in */}
            {user && authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary ring-2 ring-transparent hover:ring-primary/20 transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-md border border-border bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 text-sm text-muted-foreground border-b border-border mb-1 bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Signed in as
                          </p>
                          <p className="text-foreground font-semibold truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/create-plan"
                            className="flex w-full items-center rounded-sm px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Create Study Plan
                          </Link>
                          <Link
                            href="/settings"
                            className="flex w-full items-center rounded-sm px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary px-4 py-2"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {/* Public links */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Landing page anchor links - only when not logged in */}
            {!user && landingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth user links */}
            {user && authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Create Study Plan link for mobile */}
            {user && (
              <Link
                href="/create-plan"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive("/create-plan")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                Create Study Plan
              </Link>
            )}
          </div>

          <div className="border-t border-border pb-4 pt-4 bg-muted/20">
            {!loading && (
              <>
                {user ? (
                  <div className="px-4 space-y-3">
                    <div className="flex items-center gap-3 px-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary shadow-sm ring-1 ring-border">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-base font-medium text-foreground">
                          {user.displayName || "User"}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-3 flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center rounded-md px-3 py-2 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
