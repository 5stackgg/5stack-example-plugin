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

createApp(App, {
  user: { steam_id: "76561197960265728", name: "Dev User", role: "administrator" },
}).mount("#app");
