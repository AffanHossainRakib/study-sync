"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "GitHub", href: "https://github.com", icon: Github },
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ];

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "All Plans", href: "/plans" },
        { name: "My Instances", href: "/instances" },
        { name: "My Study Plans", href: "/my-plans" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "How It Works", href: "/#how-it-works" },
        { name: "Features", href: "/#features" },
        { name: "About", href: "/#about" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "FAQs", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
      ],
    },
  ];

  const bottomLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  // Helper function to render a column of links
  const renderSection = (section, index) => (
    <div key={section.title} className={index > 0 ? "mt-12 md:mt-0" : ""}>
      <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
        {section.title}
      </h3>
      <ul className="mt-4 space-y-4">
        {section.links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-base text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Column */}
          <div className="space-y-8 xl:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight"
            >
              <BookOpen className="h-6 w-6" />
              <span>StudySync</span>
            </Link>
            <p className="text-base text-muted-foreground max-w-xs">
              Centralize your self-learning journey. Organize YouTube playlists, PDFs, and articles in one place. Track progress across multiple study plans.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            {/* First Group (Product & Support) */}
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections
                .slice(0, 2)
                .map((section, idx) => renderSection(section, idx))}
            </div>
            {/* Second Group (Company & Legal) */}
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections
                .slice(2, 4)
                .map((section, idx) => renderSection(section, idx))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-muted-foreground">
            &copy; {new Date().getFullYear()} StudySync. All rights reserved.
          </p>
          <div className="flex gap-6">
            {bottomLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
