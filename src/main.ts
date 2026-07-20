// Standalone dev entry (not used when embedded in the panel).
import { createApp } from "vue";
import App from "./App.vue";

// Global preflight for standalone dev only — outside the panel nothing has
// reset UA styles. The panel applies its own when embedded, and shipping
// preflight is what damages the host chrome, so the guard keeps it out of the
// production bundle entirely.
if (import.meta.env.DEV) {
  import("@5stack/ui/standalone.css");
}

// Standalone there is no host to hand us a `query`, so mirror the real URL into
// the prop. That makes the embedded modes testable without a panel — try
// `?embed=1&player=76561197960265728` against `npm run dev`.
const query = Object.fromEntries(
  new URLSearchParams(window.location.search).entries(),
);

createApp(App, {
  user: { steam_id: "76561197960265728", name: "Dev User", role: "administrator" },
  query,
}).mount("#app");
