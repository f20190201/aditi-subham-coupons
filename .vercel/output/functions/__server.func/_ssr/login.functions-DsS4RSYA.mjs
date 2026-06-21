import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-WJgk8O8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login.functions-DsS4RSYA.js
var ALLOWED = ["subhamptl00@gmail.com", "2aditi.dash@gmail.com"];
var SHARED_PASSWORD = "123456";
var Schema = objectType({ email: stringType().email() });
var ensureLoginUser_createServerFn_handler = createServerRpc({
	id: "eece8689c882e31791cd4590ae29a8bc39666e0000a33c905410faa9540d1369",
	name: "ensureLoginUser",
	filename: "src/lib/login.functions.ts"
}, (opts) => ensureLoginUser.__executeServer(opts));
var ensureLoginUser = createServerFn({ method: "POST" }).inputValidator((input) => Schema.parse(input)).handler(ensureLoginUser_createServerFn_handler, async ({ data }) => {
	const email = data.email.trim().toLowerCase();
	if (!ALLOWED.includes(email)) throw new Error("This portal is just for the two of us 💕");
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
	if (listErr) throw listErr;
	const existing = list.users.find((u) => u.email?.toLowerCase() === email);
	if (!existing) {
		const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
			email,
			password: SHARED_PASSWORD,
			email_confirm: true
		});
		if (createErr) throw createErr;
	} else await supabaseAdmin.auth.admin.updateUserById(existing.id, {
		password: SHARED_PASSWORD,
		email_confirm: true
	});
	return { ok: true };
});
//#endregion
export { ensureLoginUser_createServerFn_handler };
