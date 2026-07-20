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
| `src/App.vue` | Your UI. Receives the logged-in `user` and the host `query` as props. |
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

## The player-profile tab

The manifest sets `"profileTabLabel": "Hello"`, so this plugin mounts in a second
place: as a tab on every player's profile at `/players/:steamid`, beside Combat.
Open any player page after registering and you will see it.

It is the same exposed module — not a second entry point. What changes is the
query the panel passes in:

| Query | Meaning |
| --- | --- |
| `player` | the steam64 of the profile being viewed |
| `embed` | `"1"` — you are inside someone else's page |

`src/App.vue` branches on both. Two things it is demonstrating:

**`player` is not `user`.** `user` is whoever is signed in; `player` is whose
profile is on screen. On someone else's profile they are different people, and
conflating them is how a plugin ends up letting one user act on another's data.
Anything writable must compare the two — and re-check on your backend.

**`embed` is framing, not permissions.** It means the host page already supplies
the chrome and owns the page scroll, so the embedded branch drops the hero and
the min-height. A `100dvh` layout here would push the rest of the profile
off-screen.

Delete `profileTabLabel` from the manifest if you do not want the tab; the field
is both the opt-in and the label. Admins can also override the label per-site
from the registration form.

You can exercise both modes without a panel — `src/main.ts` mirrors the real URL
into the `query` prop during standalone dev:

```sh
npm run dev   # then open /?embed=1&player=76561197960265728
```

## Renaming it

Federation scopes share one flat global namespace across every plugin an
operator installs, so `hello` will collide — pick something specific:

| Rename | In |
| --- | --- |
| `name: "hello"` | `vite.config.ts` |
| `"scope": "hello"` | `public/5stack-plugin.json` (must equal the above) |
| `"slug": "hello"` | `public/5stack-plugin.json` (your URL: `/apps/<slug>`) |
| `"profileTabLabel": "Hello"` | `public/5stack-plugin.json` (or remove it — see above) |

`data-5stack-plugin` is **not** renamed. It comes from the shared `@5stack/ui`
preset and is the same on every plugin.

## Two things that are easy to get wrong

**Vue comes from the panel, not from you.** There is deliberately no Federation
`shared` block — it rewrites imports into `await importShared(...)`, and the
resulting top-level await breaks Safari (WebKit 242740). Instead `vite.config.ts`
resolves bare `vue` to `window.__5stack_shared__.vue`, which the panel publishes.
Adding `shared` back reintroduces the bug; importing your own copy of Vue gives
you a second instance and breaks reactivity.

**Style scoping.** This plugin's CSS is injected at runtime *after* the panel's,
so unscoped utilities would override host chrome. The `@5stack/ui` preset sets
`important: "[data-5stack-plugin]"`, which scopes every generated utility under
the wrapper `div` in `App.vue` — that wrapper is required on your root. Prefer
named theme tokens over arbitrary values like `min-h-[60vh]`.

## Docs

Full guide: **https://docs.5stack.gg/plugins**

- [Getting Started](https://docs.5stack.gg/plugins/getting-started)
- [The Manifest](https://docs.5stack.gg/plugins/manifest)
- [Routing](https://docs.5stack.gg/plugins/routing)
- [Module Federation](https://docs.5stack.gg/plugins/module-federation)
- [Styling](https://docs.5stack.gg/plugins/styling)
- [Components](https://docs.5stack.gg/plugins/components)
- [Backend & Auth](https://docs.5stack.gg/plugins/backend)
- [Deploying](https://docs.5stack.gg/plugins/deploying)

For a fuller example with a backend and a database, see the
[inventory plugin](https://github.com/lukepolo/5stack-inventory-plugin).
