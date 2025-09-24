import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProblemsSection } from "@/components/problems-section"
import { AIBenefitsSection } from "@/components/ai-benefits-section"
import { SolutionSection } from "@/components/solution-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSection />
        <AIBenefitsSection />
        <SolutionSection />
      </main>
    </div>
  )
}
