/** @type {import('tailwindcss').Config} */
module.exports = {
  // The plugin preset scopes every generated utility under [data-5stack-plugin]
  // and adds the @5stack/ui content glob, so a plugin can never leak CSS onto
  // the panel's chrome. Anchor the attribute on your root element (see App.vue).
  presets: [require("@5stack/ui/tailwind-plugin-preset")],
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      // Named tokens instead of arbitrary values like `min-h-[60vh]`. Escaped
      // brackets and decimal points can be mangled when the CSS travels as a
      // JavaScript string in remoteEntry.js, so prefer named tokens throughout.
      minHeight: { hero: "60vh" },
    },
  },
};
