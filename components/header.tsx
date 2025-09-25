"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoModal } from "@/components/demo-modal";

export function Header() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                DW
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">
              DebtWise AI
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#why-ai"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Why AI?
            </a>
            <Button
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try Live Demo
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsDemoModalOpen(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try Demo
            </Button>
          </div>
        </div>
      </header>

      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </>
  );
}
