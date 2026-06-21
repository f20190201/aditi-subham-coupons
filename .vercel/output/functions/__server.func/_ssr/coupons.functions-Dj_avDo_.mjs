import { o as __toESM } from "../_runtime.mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coupons.functions-Dj_avDo_.js
var ActivateSchema = objectType({
	couponId: stringType().uuid(),
	note: stringType().max(500).optional()
});
var activateCoupon_createServerFn_handler = createServerRpc({
	id: "7dba60e0888a90053f56a8dd9c9910070b3bdea959b5af0c89634f0ff33275b3",
	name: "activateCoupon",
	filename: "src/lib/coupons.functions.ts"
}, (opts) => activateCoupon.__executeServer(opts));
var activateCoupon = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ActivateSchema.parse(input)).handler(activateCoupon_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId, claims } = context;
	const email = (claims?.email)?.toLowerCase();
	if (!email) throw new Error("No email on session");
	const { data: coupon, error: cErr } = await supabase.from("coupons").select("id, slug, title, description, emoji, cooldown_days, max_uses, is_active").eq("id", data.couponId).maybeSingle();
	if (cErr) throw cErr;
	if (!coupon || !coupon.is_active) throw new Error("Coupon not available");
	if (coupon.cooldown_days && coupon.cooldown_days > 0) {
		const { data: last } = await supabase.from("coupon_activations").select("activated_at").eq("coupon_id", coupon.id).order("activated_at", { ascending: false }).limit(1).maybeSingle();
		if (last) {
			const next = new Date(last.activated_at).getTime() + coupon.cooldown_days * 864e5;
			if (Date.now() < next) {
				const days = Math.ceil((next - Date.now()) / 864e5);
				throw new Error(`On cooldown — usable again in ${days} day${days === 1 ? "" : "s"}.`);
			}
		}
	}
	if (coupon.max_uses) {
		const { count } = await supabase.from("coupon_activations").select("id", {
			count: "exact",
			head: true
		}).eq("coupon_id", coupon.id);
		if ((count ?? 0) >= coupon.max_uses) throw new Error("All uses spent.");
	}
	const { data: row, error: insErr } = await supabase.from("coupon_activations").insert({
		coupon_id: coupon.id,
		activated_by_email: email,
		activated_by_user_id: userId,
		note: data.note ?? null
	}).select("id, activated_at").single();
	if (insErr) throw insErr;
	let emailStatus = "skipped";
	try {
		emailStatus = await sendNotificationEmail({
			to: ["subhamptl00@gmail.com", "2aditi.dash@gmail.com"],
			subject: `💌 Coupon redeemed: ${coupon.title}`,
			activator: email,
			coupon,
			note: data.note
		}) ? "sent" : "skipped";
	} catch (e) {
		console.error("Email send failed:", e);
		emailStatus = "failed";
	}
	return {
		ok: true,
		activationId: row.id,
		emailStatus
	};
});
async function sendNotificationEmail(args) {
	const GMAIL_USER = process.env.GMAIL_USER;
	const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
	if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
		console.warn("Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env. Email skipped.");
		return false;
	}
	const transporter = (await import("../_libs/nodemailer.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default.createTransport({
		service: "gmail",
		auth: {
			user: GMAIL_USER,
			pass: GMAIL_APP_PASSWORD
		}
	});
	const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #fff5f7; border-radius: 16px; color: #3d1d2a;">
      <p style="font-size: 14px; color: #a14764; margin: 0 0 8px;">A coupon was just redeemed 💕</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${args.coupon.emoji ?? "🎟️"} ${escapeHtml(args.coupon.title)}</h1>
      <p style="margin: 0 0 16px; line-height: 1.5;">${escapeHtml(args.coupon.description)}</p>
      ${args.note ? `<div style="background: #fff; padding: 12px 14px; border-radius: 10px; border-left: 3px solid #e85a8a; margin: 12px 0;"><strong>Note:</strong> ${escapeHtml(args.note)}</div>` : ""}
      <p style="font-size: 13px; color: #8a4a64; margin: 16px 0 0;">Redeemed by <strong>${escapeHtml(args.activator)}</strong> at ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
    </div>
  `;
	try {
		await transporter.sendMail({
			from: `"Our Little Coupon Book" <${GMAIL_USER}>`,
			to: args.to.join(", "),
			subject: args.subject,
			html
		});
		return true;
	} catch (error) {
		console.error("Nodemailer error:", error);
		return false;
	}
}
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
//#endregion
export { activateCoupon_createServerFn_handler };
