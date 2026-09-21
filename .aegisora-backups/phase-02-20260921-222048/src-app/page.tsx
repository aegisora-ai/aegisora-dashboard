import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow w-full flex flex-col items-center justify-center px-6">
        <div className="max-w-[800px] text-center space-y-8 mt-20 mb-32">
          
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground mb-4">
            Aegisora 1.0 Runtime Control
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Secure What Your AI Agents Are Allowed To Do.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, and authorization.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 text-base">Test Aegisora</Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 text-base">Talk to Enterprise</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
