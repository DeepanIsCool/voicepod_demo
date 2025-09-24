import { Card, CardContent } from "@/components/ui/card"
import { Clock, DollarSign, GraduationCap, RotateCcw, TrendingDown, AlertTriangle } from "lucide-react"

const problems = [
  {
    icon: Clock,
    title: "70% Actual Work Time",
    description: "Agents are productive for only 70% of their shift due to breaks, lunch, and sick days.",
  },
  {
    icon: DollarSign,
    title: "₹25,000 Recruitment Cost",
    description: "Per agent. Before they even start working.",
  },
  {
    icon: GraduationCap,
    title: "2-3 Months Training",
    description: "Zero productivity while you pay a full salary.",
  },
  {
    icon: RotateCcw,
    title: "60-80% Annual Attrition",
    description: "A constant, expensive cycle of hiring and re-training.",
  },
  {
    icon: TrendingDown,
    title: "Performance Swings",
    description: "A bad day for an agent means a bad day for your recovery rates.",
  },
  {
    icon: AlertTriangle,
    title: "Compliance Risks",
    description: "One wrong word can lead to significant RBI penalties.",
  },
]

export function ProblemsSection() {
  return (
    <section id="problems" className="py-20 sm:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            The Hidden Costs of a Human-Only Team
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Every human agent comes with overhead costs that compound over time
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, index) => {
              const IconComponent = problem.icon
              return (
                <Card key={index} className="bg-card border-border hover:bg-card/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                          <IconComponent className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Cost calculation callout */}
        <div className="mx-auto max-w-4xl mt-16">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">The Real Cost: ₹8.2 Lakhs per Agent per Year</h3>
              <p className="text-muted-foreground text-lg">
                Including salary, benefits, training, recruitment, and productivity losses
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
