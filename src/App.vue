<script setup lang="ts">
import { computed } from "vue";
import { Sparkles, User } from "lucide-vue-next";
import "./style.css";

// The panel injects the authenticated 5stack user here. It is null for guests
// when the manifest sets "requiredRole": null, so always handle that case.
//
// `query` is part of the same inbound contract. The host also passes `base`,
// `path` and `navigate` for in-plugin routing — see /plugins/routing.
const props = defineProps<{
  user?: { steam_id: string; name: string; role: string } | null;
  query?: Record<string, unknown>;
}>();

// Because the manifest sets "profileTabLabel", this same component is ALSO
// mounted as a tab on /players/:steamid. Two query keys tell us we are there.

// Who is being looked at. This is NOT `user` — on someone else's profile they
// are different people, which is why anything writable has to compare the two
// rather than assume the viewer owns what is on screen. Validate it: it comes
// from the URL, so it is user input.
const player = computed(() => {
  const p = props.query?.player;
  return typeof p === "string" && /^\d{17}$/.test(p) ? p : null;
});

// Framing only, not permissions. `embed` means the host page already supplies
// the chrome and owns the page scroll, so we drop anything that assumes we own
// the screen — full-viewport heights especially, since they would push the rest
// of the profile off-screen.
const embed = computed(() => props.query?.embed === "1");
</script>

<template>
  <!-- data-5stack-plugin anchors the `important` selector from
       @5stack/ui/tailwind-plugin-preset, so this plugin's utilities and base
       rules can never leak onto the panel's own chrome. Required on the root of
       every plugin. display:contents keeps the wrapper from adding a
       layout box. -->
  <div data-5stack-plugin style="display: contents">
    <!-- Embedded: compact, no hero, no min-height. -->
    <div v-if="embed" class="flex flex-col gap-3 p-6">
      <div class="flex items-center gap-2 text-foreground">
        <User class="h-4 w-4 text-primary" />
        <span class="font-semibold">Hello from a plugin tab</span>
      </div>
      <p class="text-sm text-muted-foreground">
        Rendered inside the player profile page, not at
        <code>/apps/hello</code>.
      </p>
      <p class="text-sm text-muted-foreground">
        Viewing profile:
        <code class="font-mono text-foreground">{{ player ?? "unknown" }}</code>
      </p>
      <p v-if="player && player === user?.steam_id" class="text-sm text-primary">
        This one is yours.
      </p>
    </div>

    <!-- Standalone at /apps/hello: the full page. -->
    <div
      v-else
      class="flex min-h-hero flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <Sparkles class="h-10 w-10 text-primary" />
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Hello from a 5stack plugin
      </h1>
      <p class="text-muted-foreground">
        <template v-if="user">
          Signed in as {{ user.name }} ({{ user.role }})
        </template>
        <template v-else>Not signed in</template>
      </p>
      <p class="max-w-md text-sm text-muted-foreground">
        This whole page is a Module Federation remote rendered natively inside
        the 5stack panel — same nav, theme, and login.
      </p>
      <p class="max-w-md text-sm text-muted-foreground">
        It also appears as a tab on any player's profile, because the manifest
        sets <code>profileTabLabel</code>.
      </p>
    </div>
  </div>
</template>
