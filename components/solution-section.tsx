import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, DollarSign, Bot, Zap } from "lucide-react"

export function SolutionSection() {
  return (
    <section id="solution" className="py-20 sm:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            The Solution: A Lean, AI-Powered Team
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Transform your debt collection with the perfect hybrid approach
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Before - Traditional Approach */}
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                    <Users className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Before</h3>
                  <p className="text-lg font-semibold text-destructive">20 Human Agents</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">High overhead costs</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Inconsistent results</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Limited working hours</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Compliance risks</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">High attrition rates</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-destructive/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">₹1.64 Cr/year</div>
                    <div className="text-sm text-muted-foreground">Total cost for 20 agents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After - AI-Powered Approach */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">After</h3>
                  <p className="text-lg font-semibold text-primary">Your Top 5 Agents + DebtWise AI</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Handles 80% of routine cases</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">40% cost reduction</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Agents focus on high-value escalations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">24/7 availability</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">100% compliance guaranteed</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-primary/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">₹98 L/year</div>
                    <div className="text-sm text-muted-foreground">Total cost for hybrid team</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits Summary */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">40% Cost Savings</h4>
              <p className="text-sm text-muted-foreground">Reduce operational costs while maintaining quality</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Higher Recovery Rates</h4>
              <p className="text-sm text-muted-foreground">AI handles routine cases, humans focus on complex ones</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Instant Scalability</h4>
              <p className="text-sm text-muted-foreground">Scale up or down instantly without hiring delays</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
