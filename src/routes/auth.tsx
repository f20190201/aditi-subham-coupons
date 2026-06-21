import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { ensureLoginUser, SHARED_PASSWORD } from "@/lib/login.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Our Little Coupon Book" },
      { name: "description", content: "A private coupon portal for two." },
    ],
  }),
  component: AuthPage,
});

const ALLOWED = [
  { email: "subhamptl00@gmail.com", label: "Subham" },
  { email: "2aditi.dash@gmail.com", label: "Aditi" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ensure = useServerFn(ensureLoginUser);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleEnter = async (email: string) => {
    setError(null);
    setBusy(email);
    try {
      await ensure({ data: { email } });
      const { error: sErr } = await supabase.auth.signInWithPassword({
        email,
        password: SHARED_PASSWORD,
      });
      if (sErr) throw sErr;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
      setBusy(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-romance-glow" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 shadow-romance backdrop-blur">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <h1 className="font-display text-4xl text-foreground">Our Little Coupon Book</h1>
            <p className="text-sm text-muted-foreground">
              For two hearts only. Sign in with your email.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">Tap your name to enter:</p>
            {ALLOWED.map((u) => (
              <button
                key={u.email}
                onClick={() => handleEnter(u.email)}
                disabled={busy !== null}
                className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60"
              >
                {busy === u.email ? "Entering…" : `I'm ${u.label}`}
              </button>
            ))}
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
