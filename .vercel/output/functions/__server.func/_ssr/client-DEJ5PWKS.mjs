import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-DEJ5PWKS.js
function createSupabaseClient() {
	return createClient("https://bbopczhferfbaplinlff.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib3BjemhmZXJmYmFwbGlubGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDcxMzgsImV4cCI6MjA5NzYyMzEzOH0.q_zU7gdLzCBM4BSkl6_CR6K_T22cHGFeCFaV_lReB3M", { auth: {
		storage: typeof window !== "undefined" ? localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
