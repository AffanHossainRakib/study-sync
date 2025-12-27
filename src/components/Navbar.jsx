"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Menu, X, LogOut, User, BookOpen } from "lucide-react";

const Navbar = () => {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation links for center section
  const centerLinks = [
    { href: "/plans", label: "All Plans", requiresAuth: false },
    { href: "/#how-it-works", label: "How It Works", requiresAuth: false },
    { href: "/#features", label: "Features", requiresAuth: false },
    { href: "/#reviews", label: "Reviews", requiresAuth: false },
    { href: "/#popular-plans", label: "Popular Plans", requiresAuth: false },
    { href: "/my-plans", label: "My Plans", requiresAuth: true },
    { href: "/instances", label: "My Instances", requiresAuth: true },
  ];

  // Helper to determine if link is active
  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight"
            >
              <BookOpen className="h-6 w-6" />
              <span>Study Sync</span>
            </Link>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-6 md:flex-1 md:justify-center">
            {centerLinks.map((link) => {
              // Show link if it doesn't require auth, or if user is logged in
              if (!link.requiresAuth || user) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                      isActive(link.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              }
              return null;
            })}
          </div>

          {/* Right Side - Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <>
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
                      Sign Up
                    </Link>
                  </>
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
            {/* All navigation links */}
            {centerLinks.map((link) => {
              // Show link if it doesn't require auth, or if user is logged in
              if (!link.requiresAuth || user) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              }
              return null;
            })}
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
                      Sign Up
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
