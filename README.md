# 5stack Plugin — Hello World

The smallest complete [5stack plugin](https://docs.5stack.gg/plugins): a Vue
Module Federation remote that renders **natively inside the 5stack panel** —
same sidebar, header, theme, and login. Copy this repo as the starting point for
your own.

```sh
npm install
npm run dev       # standalone preview at :5173 with a fake dev user
npm run build     # -> dist/
npm run preview   # serve dist/ at :4173 with CORS, for testing in a real panel
```

## What makes it a plugin

| File | Role |
| --- | --- |
| `src/App.vue` | Your UI. Receives the logged-in `user` as a prop. |
| `vite.config.ts` | Exposes `./App` as a Federation remote; declares shared singletons. |
| `public/5stack-plugin.json` | The manifest the panel auto-detects. |
| `tailwind.config.js` | Pulls in the `@5stack/ui` preset so you inherit 5stack theming. |
| `src/main.ts` | Standalone dev entry — **not** used when embedded in the panel. |

## Try it against a running panel

```sh
npm run build && npm run preview
```

Then in the panel: **Settings → Application → Plugins → Add**, paste
`http://localhost:4173`, hit **Detect**, toggle **Enabled**, and save. Make sure
the **Plugins** master switch is on. Your page appears in the sidebar at
`/apps/hello`.

`npm run preview` already sends the CORS and `no-store` headers the panel needs.
When you deploy for real, your own web server must do the same — see
[Deploying](https://docs.5stack.gg/plugins/deploying).

## Renaming it

Federation scopes share one flat global namespace across every plugin an
operator installs, so `hello` will collide — pick something specific:

| Rename | In |
| --- | --- |
| `name: "hello"` | `vite.config.ts` |
| `"scope": "hello"` | `public/5stack-plugin.json` (must equal the above) |
| `"slug": "hello"` | `public/5stack-plugin.json` (your URL: `/apps/<slug>`) |
| `[data-hello-plugin]` | `tailwind.config.js` and `src/App.vue` (must match) |

## Two things that are easy to get wrong

**Version lockstep.** Every package in `shared` is `requiredVersion: false`, so a
version that disagrees with the panel's does not error — it silently loads a
second copy and breaks reactivity. Pin the same versions the panel uses.

**Style scoping.** This plugin's CSS is injected at runtime *after* the panel's,
so unscoped utilities would override host chrome. `important:
"[data-hello-plugin]"` in `tailwind.config.js` scopes every utility under the
wrapper in `App.vue`. Keep both in sync, and prefer named theme tokens over
arbitrary values like `min-h-[60vh]`.

## Docs

Full guide: **https://docs.5stack.gg/plugins**

- [Getting Started](https://docs.5stack.gg/plugins/getting-started)
- [The Manifest](https://docs.5stack.gg/plugins/manifest)
- [Module Federation](https://docs.5stack.gg/plugins/module-federation)
- [Styling](https://docs.5stack.gg/plugins/styling)
- [Components](https://docs.5stack.gg/plugins/components)
- [Backend & Auth](https://docs.5stack.gg/plugins/backend)
- [Deploying](https://docs.5stack.gg/plugins/deploying)

For a fuller example with a backend and a database, see the
[inventory plugin](https://github.com/lukepolo/5stack-inventory-plugin).
