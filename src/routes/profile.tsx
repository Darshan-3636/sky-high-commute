import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FlyCab" },
      { name: "description", content: "Manage your FlyCab profile and payment method." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setPhone(data.phone ?? "");
        setPaymentMethod(data.payment_method ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        phone,
        payment_method: paymentMethod,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Save failed");
    else toast.success("Profile updated");
  }

  if (authLoading || !user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-neon"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <UserIcon className="h-6 w-6 text-neon-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl p-6">
          <div className="space-y-1.5">
            <Label htmlFor="dn">Display name</Label>
            <Input
              id="dn"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-11 bg-input/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9XXXXXXXXX"
              className="h-11 bg-input/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay">Payment method</Label>
            <Input
              id="pay"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="UPI / Card ending in ••••"
              className="h-11 bg-input/60"
            />
            <p className="text-xs text-muted-foreground">Mock field — no real payments processed.</p>
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className="h-11 w-full bg-gradient-neon font-semibold text-neon-foreground"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save changes</>}
          </Button>
        </div>
      </main>
    </div>
  );
}
