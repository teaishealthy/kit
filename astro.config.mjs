// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import node from "@astrojs/node";

const isProduction = process.env.NODE_ENV === "production";
const extra = isProduction
  ? {
      noExternal: true,
    }
  : {};

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // @ts-ignore
    ssr: {
      ...extra,
    },
  },

  integrations: [react()],

  adapter: node({
    mode: "standalone",
  }),
});
