import { o as __toESM } from "../_runtime.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-DEp-zZJD.mjs";
import { t as supabase } from "./client-DEJ5PWKS.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
import { r as Heart } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-5Ffsq5ac.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SHARED_PASSWORD = "123456";
var Schema = objectType({ email: stringType().email() });
var ensureLoginUser = createServerFn({ method: "POST" }).inputValidator((input) => Schema.parse(input)).handler(createSsrRpc("eece8689c882e31791cd4590ae29a8bc39666e0000a33c905410faa9540d1369"));
var ALLOWED = [{
	email: "subhamptl00@gmail.com",
	label: "Subham"
}, {
	email: "2aditi.dash@gmail.com",
	label: "Aditi"
}];
function AuthPage() {
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const ensure = useServerFn(ensureLoginUser);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) navigate({ to: "/" });
		});
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_IN") navigate({ to: "/" });
		});
		return () => sub.subscription.unsubscribe();
	}, [navigate]);
	const handleEnter = async (email) => {
		setError(null);
		setBusy(email);
		try {
			await ensure({ data: { email } });
			const { error: sErr } = await supabase.auth.signInWithPassword({
				email,
				password: SHARED_PASSWORD
			});
			if (sErr) throw sErr;
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not sign in");
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen overflow-hidden bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-romance-glow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 flex min-h-screen items-center justify-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 shadow-romance backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-col items-center gap-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-7 w-7 fill-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl text-foreground",
							children: "Our Little Coupon Book"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "For two hearts only. Sign in with your email."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-sm text-muted-foreground",
							children: "Tap your name to enter:"
						}),
						ALLOWED.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleEnter(u.email),
							disabled: busy !== null,
							className: "w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60",
							children: busy === u.email ? "Entering…" : `I'm ${u.label}`
						}, u.email)),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-sm text-destructive",
							children: error
						})
					]
				})]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
