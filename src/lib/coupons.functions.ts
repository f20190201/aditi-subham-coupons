import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ActivateSchema = z.object({
  couponId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export const activateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ActivateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims?.email as string | undefined)?.toLowerCase();
    if (!email) throw new Error("No email on session");

    // Load coupon
    const { data: coupon, error: cErr } = await supabase
      .from("coupons")
      .select("id, slug, title, description, emoji, cooldown_days, max_uses, is_active")
      .eq("id", data.couponId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coupon || !coupon.is_active) throw new Error("Coupon not available");

    // Cooldown check
    if (coupon.cooldown_days && coupon.cooldown_days > 0) {
      const { data: last } = await supabase
        .from("coupon_activations")
        .select("activated_at")
        .eq("coupon_id", coupon.id)
        .order("activated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last) {
        const lastTs = new Date(last.activated_at).getTime();
        const next = lastTs + coupon.cooldown_days * 86400000;
        if (Date.now() < next) {
          const days = Math.ceil((next - Date.now()) / 86400000);
          throw new Error(`On cooldown — usable again in ${days} day${days === 1 ? "" : "s"}.`);
        }
      }
    }

    // Max uses check
    if (coupon.max_uses) {
      const { count } = await supabase
        .from("coupon_activations")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);
      if ((count ?? 0) >= coupon.max_uses) throw new Error("All uses spent.");
    }

    // Insert activation
    const { data: row, error: insErr } = await supabase
      .from("coupon_activations")
      .insert({
        coupon_id: coupon.id,
        activated_by_email: email,
        activated_by_user_id: userId,
        note: data.note ?? null,
      })
      .select("id, activated_at")
      .single();
    if (insErr) throw insErr;

    // Try to send notification email (best-effort, never block activation)
    let emailStatus: "sent" | "skipped" | "failed" = "skipped";
    try {
      const recipients = ["subhamptl00@gmail.com", "2aditi.dash@gmail.com"];
      const sent = await sendNotificationEmail({
        to: recipients,
        subject: `💌 Coupon redeemed: ${coupon.title}`,
        activator: email,
        coupon,
        note: data.note,
      });
      emailStatus = sent ? "sent" : "skipped";
    } catch (e) {
      console.error("Email send failed:", e);
      emailStatus = "failed";
    }

    return { ok: true, activationId: row.id, emailStatus };
  });

async function sendNotificationEmail(args: {
  to: string[];
  subject: string;
  activator: string;
  coupon: { title: string; description: string; emoji: string | null };
  note?: string;
}): Promise<boolean> {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn("Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env. Email skipped.");
    return false;
  }

  // Dynamically import so it doesn't break the client bundle
  const nodemailer = (await import("nodemailer")).default;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #fff5f7; border-radius: 16px; color: #3d1d2a;">
      <p style="font-size: 14px; color: #a14764; margin: 0 0 8px;">A coupon was just redeemed 💕</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${args.coupon.emoji ?? "🎟️"} ${escapeHtml(args.coupon.title)}</h1>
      <p style="margin: 0 0 16px; line-height: 1.5;">${escapeHtml(args.coupon.description)}</p>
      ${args.note ? `<div style="background: #fff; padding: 12px 14px; border-radius: 10px; border-left: 3px solid #e85a8a; margin: 12px 0;"><strong>Note:</strong> ${escapeHtml(args.note)}</div>` : ""}
      <p style="font-size: 13px; color: #8a4a64; margin: 16px 0 0;">Redeemed by <strong>${escapeHtml(args.activator)}</strong> at ${new Date().toLocaleString()}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Our Little Coupon Book" <${GMAIL_USER}>`,
      to: args.to.join(", "),
      subject: args.subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Nodemailer error:", error);
    return false;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
