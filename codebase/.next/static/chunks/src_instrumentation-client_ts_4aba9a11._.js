(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/instrumentation-client.ts [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, k: __turbopack_refresh__, m: module, e: exports } = __turbopack_context__;
{
// Initialize analytics before the app starts
console.log("Analytics initialized");
// Set up global error tracking
window.addEventListener("error", (event)=>{
    console.log("global error event");
    // Send to your error tracking service
    window.parent.postMessage({
        type: "VLY_RUNTIME_ERROR",
        error: event.error,
        timestamp: new Date().getTime()
    }, "*");
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_instrumentation-client_ts_4aba9a11._.js.map