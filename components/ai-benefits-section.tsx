import { Languages, Zap, Brain, Database } from "lucide-react"

const benefits = [
  {
    icon: Languages,
    title: "Speaks 15+ Indian Languages Fluently",
    description:
      "Connect with every customer in their native tongue. From Hindi and English to Tamil, Telugu, Bengali, and regional dialects.",
    alignment: "left" as const,
  },
  {
    icon: Zap,
    title: "Zero Training Time",
    description:
      "Update processes and guidelines for all AI agents instantly. No downtime, no retraining costs, immediate deployment.",
    alignment: "right" as const,
  },
  {
    icon: Brain,
    title: "Perfect Recall, Every Time",
    description:
      "Remembers every past interaction for perfect context. Complete customer history, payment patterns, and preferences at fingertips.",
    alignment: "left" as const,
  },
  {
    icon: Database,
    title: "No After-Call Work",
    description:
      "Updates your CRM instantly and automatically. Real-time data entry, call summaries, and follow-up scheduling without human intervention.",
    alignment: "right" as const,
  },
]

export function AIBenefitsSection() {
  return (
    <section id="why-ai" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Gain a Competitive Edge with AI
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Experience the advantages that only AI can deliver
          </p>
        </div>

        <div className="mx-auto max-w-6xl space-y-20">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            const isLeft = benefit.alignment === "left"

            return (
              <div key={index} className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
                {/* Text Content */}
                <div className={`${isLeft ? "lg:order-1" : "lg:order-2"} space-y-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{benefit.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>

                {/* Visual Element */}
                <div className={`${isLeft ? "lg:order-2" : "lg:order-1"} flex items-center justify-center`}>
                  <div className="relative">
                    <div className="h-64 w-64 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <IconComponent className="h-24 w-24 text-primary/60" />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-primary/20"></div>
                    <div className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-primary/30"></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Performance comparison */}
        <div className="mx-auto max-w-4xl mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Always Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Compliance Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">0 sec</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
