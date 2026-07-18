<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
import "./style.css";

// The panel injects the authenticated 5stack user here. It is null for guests
// when the manifest sets "requiredRole": null, so always handle that case.
defineProps<{
  user?: { steam_id: string; name: string; role: string } | null;
}>();
</script>

<template>
  <!-- data-5stack-plugin anchors the `important` selector from
       @5stack/ui/tailwind-plugin-preset, so this plugin's utilities and base
       rules can never leak onto the panel's own chrome. Required on the root of
       every plugin. display:contents keeps the wrapper from adding a
       layout box. -->
  <div data-5stack-plugin style="display: contents">
    <div
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
    </div>
  </div>
</template>
