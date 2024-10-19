import defaultTheme from "tailwindcss/defaultTheme";
import { join } from "node:path";
import { skeleton } from "@skeletonlabs/tw-plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    join(
      require.resolve("@skeletonlabs/skeleton"),
      "../**/*.{html,js,svelte,ts}",
    ),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    skeleton({
      themes: { preset: ["wintry"] },
    }),
  ],
};
