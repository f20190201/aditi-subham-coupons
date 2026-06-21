import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { activateCoupon } from "@/lib/coupons.functions";
import { Heart, LogOut, Sparkles, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Our Little Coupon Book" },
      { name: "description", content: "A private coupon book just for us." },
    ],
  }),
  component: CouponPortal,
});

type Coupon = {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string | null;
  cooldown_days: number;
  max_uses: number | null;
  is_active: boolean;
  sort_order: number;
};

type Activation = {
  id: string;
  coupon_id: string;
  activated_by_email: string;
  activated_at: string;
  note: string | null;
};

function CouponPortal() {
  const router = useRouter();
  const navigate = useNavigate();
  const activate = useServerFn(activateCoupon);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? ""));
  }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: a }] = await Promise.all([
      supabase.from("coupons").select("*").eq("is_active", true).order("sort_order"),
      supabase
        .from("coupon_activations")
        .select("id, coupon_id, activated_by_email, activated_at, note")
        .order("activated_at", { ascending: false })
        .limit(50),
    ]);
    setCoupons((c ?? []) as Coupon[]);
    setActivations((a ?? []) as Activation[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const lastByCoupon = useMemo(() => {
    const m = new Map<string, Activation>();
    for (const a of activations) if (!m.has(a.coupon_id)) m.set(a.coupon_id, a);
    return m;
  }, [activations]);

  const countByCoupon = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of activations) m.set(a.coupon_id, (m.get(a.coupon_id) ?? 0) + 1);
    return m;
  }, [activations]);

  function statusOf(c: Coupon): { kind: "ready" | "cooldown" | "spent"; label: string } {
    if (c.max_uses && (countByCoupon.get(c.id) ?? 0) >= c.max_uses) {
      return { kind: "spent", label: "All uses spent" };
    }
    const last = lastByCoupon.get(c.id);
    if (last && c.cooldown_days > 0) {
      const next = new Date(last.activated_at).getTime() + c.cooldown_days * 86400000;
      if (Date.now() < next) {
        const days = Math.ceil((next - Date.now()) / 86400000);
        return { kind: "cooldown", label: `Ready in ${days} day${days === 1 ? "" : "s"}` };
      }
    }
    return { kind: "ready", label: "Ready to redeem" };
  }

  async function handleActivate(coupon: Coupon) {
    setActivatingId(coupon.id);
    try {
      const result = await activate({
        data: { couponId: coupon.id, note: note.trim() || undefined },
      });
      const tail =
        result.emailStatus === "sent"
          ? "Notification sent 💌"
          : result.emailStatus === "failed"
            ? "Saved (email failed to send)"
            : "Saved (email not configured yet)";
      setToast({ kind: "ok", msg: `${coupon.title} redeemed. ${tail}` });
      setOpenId(null);
      setNote("");
      await load();
    } catch (e) {
      setToast({ kind: "err", msg: e instanceof Error ? e.message : "Couldn't redeem" });
    } finally {
      setActivatingId(null);
      setTimeout(() => setToast(null), 4500);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-romance-glow" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Heart className="h-3.5 w-3.5 fill-current" /> Just for us
            </div>
            <h1 className="font-display text-5xl text-foreground sm:text-6xl">
              Our Little Coupon Book
            </h1>
            <p className="mt-2 text-muted-foreground">
              Signed in as <span className="text-foreground">{userEmail}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur transition hover:bg-card"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </header>

        {loading ? (
          <p className="text-muted-foreground">Loading our coupons…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => {
              const status = statusOf(c);
              const isOpen = openId === c.id;
              const used = countByCoupon.get(c.id) ?? 0;
              return (
                <article
                  key={c.id}
                  className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur transition hover:shadow-romance"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-4xl">{c.emoji ?? "🎟️"}</span>
                    <StatusPill status={status} />
                  </div>
                  <h2 className="font-display text-2xl leading-tight text-foreground">{c.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {c.cooldown_days > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> every {c.cooldown_days}d
                      </span>
                    )}
                    {c.max_uses && (
                      <span>
                        {used}/{c.max_uses} used
                      </span>
                    )}
                  </div>

                  {isOpen ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a sweet note (optional)"
                        rows={2}
                        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setOpenId(null);
                            setNote("");
                          }}
                          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleActivate(c)}
                          disabled={activatingId === c.id}
                          className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60"
                        >
                          {activatingId === c.id ? "Redeeming…" : "Confirm"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (status.kind === "ready") setOpenId(c.id);
                      }}
                      disabled={status.kind !== "ready"}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                    >
                      <Sparkles className="h-4 w-4" />
                      {status.kind === "ready" ? "Redeem coupon" : status.label}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {activations.length > 0 && (
          <section className="mt-14">
            <h3 className="font-display text-2xl text-foreground">Recent redemptions</h3>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur">
              {activations.slice(0, 10).map((a) => {
                const c = coupons.find((x) => x.id === a.coupon_id);
                return (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{c?.title ?? "Coupon"}</span>
                    <span className="text-muted-foreground">by {a.activated_by_email}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(a.activated_at).toLocaleString()}
                    </span>
                    {a.note && (
                      <p className="w-full pl-7 text-xs italic text-muted-foreground">"{a.note}"</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-romance backdrop-blur ${
            toast.kind === "ok"
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}

function StatusPill({
  status,
}: {
  status: { kind: "ready" | "cooldown" | "spent"; label: string };
}) {
  const cls =
    status.kind === "ready"
      ? "bg-primary/15 text-primary"
      : status.kind === "cooldown"
        ? "bg-muted text-muted-foreground"
        : "bg-destructive/15 text-destructive";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      {status.label}
    </span>
  );
}
