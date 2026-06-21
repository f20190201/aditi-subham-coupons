//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-BoWm4Evz.js
var manifest = {
	"7dba60e0888a90053f56a8dd9c9910070b3bdea959b5af0c89634f0ff33275b3": {
		functionName: "activateCoupon_createServerFn_handler",
		importer: () => import("./_ssr/coupons.functions-Dj_avDo_.mjs")
	},
	"eece8689c882e31791cd4590ae29a8bc39666e0000a33c905410faa9540d1369": {
		functionName: "ensureLoginUser_createServerFn_handler",
		importer: () => import("./_ssr/login.functions-DsS4RSYA.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
