import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import * as vueNs from "vue";

// Borrow the panel's Vue instead of bundling a second copy.
//
// This replaces Federation `shared`. Federation implements sharing by rewriting
// every import of a shared package into `await importShared(...)`, which makes
// the importing chunk an async module. Safari throws
// "Cannot access '<x>' before initialization" when several modules import the
// same top-level-await module concurrently (WebKit bug 242740, fixed only in
// STP 243+ — shipping iOS Safari still has it). The panel hit exactly that.
//
// So: no `shared`, no top-level await. The panel publishes its Vue on
// `window.__5stack_shared__` and this plugin resolves bare `vue` to a small
// synchronous module that reads it. One Vue instance, no async chunks.
//
// Only `vue` is bridged — it is the one package where a second copy breaks
// reactivity and component context. Everything else is bundled normally, and
// anything bundled that imports Vue (reka-ui, @5stack/ui) resolves through
// this same bridge, so there is still exactly one Vue in the page.
const VIRTUAL = "\0__5stack_shared__:";

// Enumerated at build time from the installed vue, because ESM named exports
// must be static — they cannot be spread off a runtime object.
const VUE_EXPORTS = Object.keys(vueNs).filter((name) => name !== "default");

function sharedGlobals() {
  return {
    name: "5stack-shared-globals",
    // Must beat Vite's own resolver, which would otherwise resolve `vue` to
    // node_modules and bundle it.
    enforce: "pre" as const,
    resolveId(id: string) {
      return id === "vue" ? `${VIRTUAL}vue` : null;
    },
    load(id: string) {
      if (!id.startsWith(VIRTUAL)) {
        return null;
      }
      return [
        `const shared = globalThis.__5stack_shared__;`,
        `const m = shared && shared.vue;`,
        `if (!m) {`,
        `  throw new Error(`,
        `    "[5stack] The panel did not publish a shared Vue instance. " +`,
        `    "This plugin needs a panel build that provides window.__5stack_shared__."`,
        `  );`,
        `}`,
        `export default m.default ?? m;`,
        ...VUE_EXPORTS.map(
          (name) => `export const ${name} = m[${JSON.stringify(name)}];`,
        ),
      ].join("\n");
    },
  };
}

export default defineConfig({
  plugins: [
    sharedGlobals(),
    vue(),
    // Federation shares JS, not CSS. This inlines the compiled Tailwind into
    // remoteEntry.js so styles install themselves when the remote mounts.
    cssInjectedByJs(),
    federation({
      // Must match "scope" in public/5stack-plugin.json. Federation scopes are a
      // flat global namespace shared with every other installed plugin — rename
      // this to something specific to your plugin.
      name: "hello",
      filename: "remoteEntry.js",
      exposes: {
        // Must match "module" in public/5stack-plugin.json.
        "./App": "./src/App.vue",
      },
      // Intentionally no `shared` — see sharedGlobals() above. Adding anything
      // here reintroduces the top-level await that breaks the panel in Safari.
    }),
  ],
  // `vue` resolves to the virtual bridge module, so Vite must not try to
  // pre-bundle the real package into an optimized dep.
  optimizeDeps: {
    exclude: ["vue"],
  },
  build: {
    // remoteEntry.js itself still uses top-level await. That one is safe: it is
    // a single isolated entry, not fanned out across the whole app.
    target: "esnext",
    cssCodeSplit: false,
    // reka-ui and lucide are bundled into this remote (only Vue comes from the
    // panel), so their size is expected.
    chunkSizeWarningLimit: 900,
  },
  // `npm run preview` serves the built output for testing against a running
  // panel. The panel imports remoteEntry.js cross-origin, so it needs CORS; and
  // remoteEntry.js keeps a stable filename while its contents change every
  // build, so it must never be cached or the panel will run stale code.
  preview: {
    cors: true,
    allowedHosts: true,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  },
});
