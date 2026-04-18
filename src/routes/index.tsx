import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, MapPin, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlyCab — Skip Bengaluru traffic. Fly across the city." },
      {
        name: "description",
        content:
          "Autonomous VTOL flying taxis in Bengaluru. Book Eco, Business, or First class flights between any two points in the city.",
      },
      { property: "og:title", content: "FlyCab — Skip Bengaluru traffic. Fly across the city." },
      {
        property: "og:description",
        content: "Whitefield to Electronic City in minutes, not hours.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-neon"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Plane className="h-5 w-5 text-neon-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Fly<span className="text-neon text-glow">Cab</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-neon text-neon-foreground hover:opacity-90"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Link to="/auth" search={{ mode: "signup" } as never}>Get started</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-24 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/5 px-3 py-1 text-xs font-medium text-neon">
            <Sparkles className="h-3 w-3" />
            Now operating in Bengaluru
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tighter sm:text-7xl">
            Bengaluru traffic
            <br />
            <span className="text-neon text-glow">isn't a problem</span>
            <br />
            from <span className="bg-gradient-magenta bg-clip-text text-transparent">300m up.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Autonomous VTOL flying taxis between any two points in the city.
            Whitefield to Electronic City in <span className="font-mono text-neon">11 minutes</span>.
            Not 2 hours.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 bg-gradient-neon px-7 font-semibold text-neon-foreground hover:opacity-90"
              style={{ boxShadow: "var(--shadow-glow-lg)" }}
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Book your first flight
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 px-5 text-muted-foreground">
              <Link to="/auth">I have an account</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Clock,
              title: "10× faster",
              desc: "Aerial corridors bypass every signal, jam, and one-way",
            },
            {
              icon: MapPin,
              title: "Anywhere in BLR",
              desc: "Pin-drop pickup from Indiranagar to Yelahanka",
            },
            {
              icon: ShieldCheck,
              title: "Fully autonomous",
              desc: "Triple-redundant flight systems, weather-aware routing",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass relative overflow-hidden rounded-2xl p-5"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neon/10 text-neon"
                style={{ boxShadow: "inset 0 0 20px oklch(0.82 0.16 200 / 0.2)" }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid gap-3 sm:grid-cols-3"
        >
          {[
            { name: "Eco", price: "199", per: "+ ₹35/km" },
            { name: "Business", price: "399", per: "+ ₹75/km", featured: true },
            { name: "First", price: "899", per: "+ ₹160/km" },
          ].map((t) => (
            <div
              key={t.name}
              className={`glass rounded-2xl p-5 ${
                t.featured ? "border-neon/40" : ""
              }`}
              style={t.featured ? { boxShadow: "var(--shadow-glow)" } : undefined}
            >
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                FlyCab
              </div>
              <div className="font-display text-2xl font-bold">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-neon">₹{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.per}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        FlyCab · Bengaluru aerial network · Built for the next decade of mobility
      </footer>
    </div>
  );
}
