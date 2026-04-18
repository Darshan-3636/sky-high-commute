import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { Plane } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-neon text-glow">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Off the flight path</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn't exist in the FlyCab network.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-neon px-4 py-2 text-sm font-medium text-neon-foreground"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <Plane className="mr-2 h-4 w-4" />
          Back to base
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "FlyCab — Autonomous flying taxis over Bengaluru" },
      {
        name: "description",
        content:
          "Skip Bengaluru's traffic. Book autonomous VTOL flying taxis between any two points in the city — Eco, Business, or First class.",
      },
      { name: "author", content: "FlyCab" },
      { property: "og:title", content: "FlyCab — Autonomous flying taxis over Bengaluru" },
      {
        property: "og:description",
        content: "VTOL taxis on demand. Whitefield to Electronic City in minutes, not hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
