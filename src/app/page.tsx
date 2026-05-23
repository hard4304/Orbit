import Link from "next/link";
import { OrbitLogo } from "@/components/ui/orbit-logo";
import {
  CheckSquare, Dumbbell, Wallet, Utensils, BookOpen, Sparkles, Bug,
  ArrowRight, Zap, BarChart3, Shield,
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "Habit Tracking",
    description: "Build consistent daily routines with visual streak tracking and weekly overviews.",
    color: "bg-habit-pink/20",
  },
  {
    icon: Dumbbell,
    title: "Gym Mode",
    description: "Track exercises, sets, weights, and rest times in real-time during your workouts.",
    color: "bg-habit-blue/20",
  },
  {
    icon: Wallet,
    title: "Personal Finance",
    description: "Monitor daily expenses by category and payment method with monthly summaries.",
    color: "bg-habit-purple/20",
  },
  {
    icon: Utensils,
    title: "Food Tracker",
    description: "Log meals with nutrition data, search foods, and track calories and macros.",
    color: "bg-habit-green/20",
  },
  {
    icon: BookOpen,
    title: "Learning Journal",
    description: "Record what you study with categories, tags, and time tracking.",
    color: "bg-habit-yellow/20",
  },
  {
    icon: Sparkles,
    title: "Body Care",
    description: "Track skincare, haircare, and self-care routines with product logging.",
    color: "bg-habit-peach/20",
  },
  {
    icon: Bug,
    title: "Bug & Feature Reports",
    description: "Submit feedback and track the status of reported issues and feature requests.",
    color: "bg-muted",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up in seconds — no credit card, no fuss.",
  },
  {
    number: "02",
    title: "Set up your modules",
    description: "Enable the trackers you care about — habits, gym, food, finance, and more.",
  },
  {
    number: "03",
    title: "Track & improve",
    description: "Log daily, watch your streaks grow, and see your progress on the dashboard.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-sidebar-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <OrbitLogo size={36} />
            <span className="text-xl font-bold font-heading text-primary">orbit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <OrbitLogo size={72} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground">
            Track your life,{" "}
            <span className="text-primary">beautifully.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Habits, workouts, nutrition, finances, learning, and self-care — all in one
            minimal, warm dashboard built for people who care about consistency.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Everything you need
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
            7 modules. One dashboard.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`${feature.color} rounded-2xl p-6 transition-transform hover:scale-[1.02]`}
            >
              <feature.icon className="size-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Simple by design
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
            How It Works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                {step.number === "01" ? (
                  <Zap className="size-6 text-primary" />
                ) : step.number === "02" ? (
                  <BarChart3 className="size-6 text-primary" />
                ) : (
                  <Shield className="size-6 text-primary" />
                )}
              </div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
                Step {step.number}
              </p>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading">
            Ready to build better habits?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join Orbit and start tracking the things that matter. Free, minimal, and built for daily use.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sidebar-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <OrbitLogo size={24} />
            <span className="text-sm font-medium text-muted-foreground">
              orbit
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with care. Track your life, beautifully.
          </p>
        </div>
      </footer>
    </div>
  );
}
