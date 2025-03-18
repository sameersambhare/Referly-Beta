import Link from "next/link"
import { Button } from "./components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section - Asymmetric Split Design */}
      <section className="relative w-full overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute top-[30%] left-[20%] w-[20%] h-[20%] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-block">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
                  <span className="animate-pulse mr-1">•</span> Now with AI-powered referral insights
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block">Transform</span>
                <span className="block mt-1 text-primary">Connections</span>
                <span className="block mt-1">Into Growth</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px]">
                Referly reimagines how businesses leverage their network, turning every interaction into an opportunity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full">
                    Start Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 rounded-full">
                    See How It Works
                  </Button>
                </Link>
              </div>
              
              <div className="pt-4 flex items-center space-x-4 text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium`}>
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Joined by <span className="font-medium text-foreground">2,000+</span> businesses
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden border shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-8 flex items-center justify-center">
                  <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2">
                      <div className="w-1/2 h-6 bg-primary/20 rounded-md"></div>
                      <div className="w-3/4 h-4 bg-primary/10 rounded-md"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1 aspect-square bg-background/80 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 mb-2"></div>
                        <div className="w-3/4 h-3 bg-primary/10 rounded-md"></div>
                      </div>
                      <div className="col-span-1 aspect-square bg-background/80 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 mb-2"></div>
                        <div className="w-3/4 h-3 bg-primary/10 rounded-md"></div>
                      </div>
                      <div className="col-span-1 aspect-square bg-background/80 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 mb-2"></div>
                        <div className="w-3/4 h-3 bg-primary/10 rounded-md"></div>
                      </div>
                      <div className="col-span-1 aspect-square bg-background/80 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 mb-2"></div>
                        <div className="w-3/4 h-3 bg-primary/10 rounded-md"></div>
                      </div>
                    </div>
                    
                    <div className="w-full h-10 bg-primary/20 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border-8 border-dashed border-primary/10 animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Horizontal Scroll Cards */}
      <section id="how-it-works" className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/>
              </svg>
              The Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              Referrals <span className="text-primary">Reimagined</span>
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
              A fresh approach to growing your business through your network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect",
                description: "Link your existing customer base and identify high-value referral opportunities with our AI analysis.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )
              },
              {
                title: "Engage",
                description: "Create personalized referral campaigns that resonate with your audience and drive meaningful action.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                )
              },
              {
                title: "Grow",
                description: "Track performance, optimize campaigns, and scale your referral program with data-driven insights.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl border bg-background p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 transform rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-500"></div>
                
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {item.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                
                <div className="mt-4 flex items-center text-primary">
                  <span className="text-sm font-medium">Learn more</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Interactive Grid */}
      <section className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              Everything You <span className="text-primary">Need</span>
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
              Powerful tools designed for modern businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Assistant",
                description: "Get personalized recommendations and insights to optimize your referral strategy.",
                icon: "✨"
              },
              {
                title: "Visual Analytics",
                description: "Track performance with beautiful, intuitive dashboards and reports.",
                icon: "📊"
              },
              {
                title: "Smart Campaigns",
                description: "Create targeted campaigns that convert with our intelligent templates.",
                icon: "🚀"
              },
              {
                title: "Relationship CRM",
                description: "Manage your network and nurture relationships all in one place.",
                icon: "🤝"
              },
              {
                title: "Automated Follow-ups",
                description: "Never miss an opportunity with intelligent follow-up sequences.",
                icon: "⏱️"
              },
              {
                title: "Reward Management",
                description: "Design and track incentives that motivate referrals and drive results.",
                icon: "🎁"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border bg-background p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Floating Card Design */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-background p-8 md:p-12 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Ready to ignite your growth?
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-[600px]">
                Join thousands of forward-thinking businesses already transforming their referral strategy with Referly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-lg px-8">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full text-lg px-8">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
