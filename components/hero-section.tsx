"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoModal } from "@/components/demo-modal"

export function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden bg-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
              You're paying <span className="text-primary">₹5.67 per minute</span> for human agents.
            </h1>

            {/* Sub-headline */}
            <p className="mt-8 text-lg leading-8 text-muted-foreground sm:text-xl lg:text-2xl text-pretty max-w-3xl mx-auto">
              Our AI costs just <span className="font-semibold text-primary">₹5.00 per minute</span>. No salaries. No
              overheads. Just infinite scalability and{" "}
              <span className="font-semibold text-foreground">100% compliance guaranteed</span>.
            </p>

            {/* CTA Button */}
            <div className="mt-12">
              <Button
                onClick={() => setIsDemoModalOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 h-auto"
              >
                Try Live Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>RBI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>15+ Languages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  )
}
