import { o as __toESM } from "./_runtime.mjs";
import { _ as useRouter, g as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./_ssr/esm-Dova13aH.mjs";
import { n as require_jsx_runtime, r as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { n as useServerFn, t as createSsrRpc } from "./_ssr/createSsrRpc-DEp-zZJD.mjs";
import { t as requireSupabaseAuth } from "./_ssr/auth-middleware-QP6BYy5L.mjs";
import { t as supabase } from "./_ssr/client-DEJ5PWKS.mjs";
import { n as stringType, t as objectType } from "./_libs/zod.mjs";
import { a as CircleCheck, i as Clock, n as LogOut, r as Heart, t as Sparkles } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-BDrdigyI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ActivateSchema = objectType({
	couponId: stringType().uuid(),
	note: stringType().max(500).optional()
});
var activateCoupon = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ActivateSchema.parse(input)).handler(createSsrRpc("7dba60e0888a90053f56a8dd9c9910070b3bdea959b5af0c89634f0ff33275b3"));
function CouponPortal() {
	const router = useRouter();
	const navigate = useNavigate();
	const activate = useServerFn(activateCoupon);
	const [coupons, setCoupons] = (0, import_react.useState)([]);
	const [activations, setActivations] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activatingId, setActivatingId] = (0, import_react.useState)(null);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [userEmail, setUserEmail] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? ""));
	}, []);
	const load = async () => {
		setLoading(true);
		const [{ data: c }, { data: a }] = await Promise.all([supabase.from("coupons").select("*").eq("is_active", true).order("sort_order"), supabase.from("coupon_activations").select("id, coupon_id, activated_by_email, activated_at, note").order("activated_at", { ascending: false }).limit(50)]);
		setCoupons(c ?? []);
		setActivations(a ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const lastByCoupon = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const a of activations) if (!m.has(a.coupon_id)) m.set(a.coupon_id, a);
		return m;
	}, [activations]);
	const countByCoupon = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const a of activations) m.set(a.coupon_id, (m.get(a.coupon_id) ?? 0) + 1);
		return m;
	}, [activations]);
	function statusOf(c) {
		if (c.max_uses && (countByCoupon.get(c.id) ?? 0) >= c.max_uses) return {
			kind: "spent",
			label: "All uses spent"
		};
		const last = lastByCoupon.get(c.id);
		if (last && c.cooldown_days > 0) {
			const next = new Date(last.activated_at).getTime() + c.cooldown_days * 864e5;
			if (Date.now() < next) {
				const days = Math.ceil((next - Date.now()) / 864e5);
				return {
					kind: "cooldown",
					label: `Ready in ${days} day${days === 1 ? "" : "s"}`
				};
			}
		}
		return {
			kind: "ready",
			label: "Ready to redeem"
		};
	}
	async function handleActivate(coupon) {
		setActivatingId(coupon.id);
		try {
			const result = await activate({ data: {
				couponId: coupon.id,
				note: note.trim() || void 0
			} });
			const tail = result.emailStatus === "sent" ? "Notification sent 💌" : result.emailStatus === "failed" ? "Saved (email failed to send)" : "Saved (email not configured yet)";
			setToast({
				kind: "ok",
				msg: `${coupon.title} redeemed. ${tail}`
			});
			setOpenId(null);
			setNote("");
			await load();
		} catch (e) {
			setToast({
				kind: "err",
				msg: e instanceof Error ? e.message : "Couldn't redeem"
			});
		} finally {
			setActivatingId(null);
			setTimeout(() => setToast(null), 4500);
		}
	}
	async function handleSignOut() {
		await supabase.auth.signOut();
		router.invalidate();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-romance-glow" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "mb-10 flex flex-wrap items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-3.5 w-3.5 fill-current" }), " Just for us"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-5xl text-foreground sm:text-6xl",
								children: "Our Little Coupon Book"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-muted-foreground",
								children: ["Signed in as ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: userEmail
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleSignOut,
							className: "inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur transition hover:bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sign out"]
						})]
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Loading our coupons…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
						children: coupons.map((c) => {
							const status = statusOf(c);
							const isOpen = openId === c.id;
							const used = countByCoupon.get(c.id) ?? 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur transition hover:shadow-romance",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-4xl",
											children: c.emoji ?? "🎟️"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl leading-tight text-foreground",
										children: c.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 flex-1 text-sm leading-relaxed text-muted-foreground",
										children: c.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex items-center gap-3 text-xs text-muted-foreground",
										children: [c.cooldown_days > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
												" every ",
												c.cooldown_days,
												"d"
											]
										}), c.max_uses && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											used,
											"/",
											c.max_uses,
											" used"
										] })]
									}),
									isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: note,
											onChange: (e) => setNote(e.target.value),
											placeholder: "Add a sweet note (optional)",
											rows: 2,
											className: "w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													setOpenId(null);
													setNote("");
												},
												className: "flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted",
												children: "Cancel"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => handleActivate(c),
												disabled: activatingId === c.id,
												className: "flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60",
												children: activatingId === c.id ? "Redeeming…" : "Confirm"
											})]
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											if (status.kind === "ready") setOpenId(c.id);
										},
										disabled: status.kind !== "ready",
										className: "mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), status.kind === "ready" ? "Redeem coupon" : status.label]
									})
								]
							}, c.id);
						})
					}),
					activations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-foreground",
							children: "Recent redemptions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur",
							children: activations.slice(0, 10).map((a) => {
								const c = coupons.find((x) => x.id === a.coupon_id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: c?.title ?? "Coupon"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: ["by ", a.activated_by_email]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto text-xs text-muted-foreground",
											children: new Date(a.activated_at).toLocaleString()
										}),
										a.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "w-full pl-7 text-xs italic text-muted-foreground",
											children: [
												"\"",
												a.note,
												"\""
											]
										})
									]
								}, a.id);
							})
						})]
					})
				]
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-romance backdrop-blur ${toast.kind === "ok" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`,
				children: toast.msg
			})
		]
	});
}
function StatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-full px-2.5 py-1 text-[11px] font-medium ${status.kind === "ready" ? "bg-primary/15 text-primary" : status.kind === "cooldown" ? "bg-muted text-muted-foreground" : "bg-destructive/15 text-destructive"}`,
		children: status.label
	});
}
//#endregion
export { CouponPortal as component };
