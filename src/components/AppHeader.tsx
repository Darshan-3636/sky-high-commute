import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plane, History, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth" });
  }

  const navItems = [
    { to: "/app", label: "Book", icon: Plane },
    { to: "/trips", label: "Trips", icon: History },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 glass-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/app" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-neon"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Plane className="h-5 w-5 text-neon-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Fly<span className="text-neon text-glow">Cab</span>
          </span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-neon/15 text-neon"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
