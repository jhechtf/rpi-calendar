<script lang="ts">
  import type { Snippet } from "svelte";
  import "../app.css";
  import { readTextFile, exists, BaseDirectory } from "@tauri-apps/api/fs";
  import type { AppConfig } from "$lib/types/config";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Apply the saved theme preference as early as possible after mount.
  // $effect is appropriate here: it needs the DOM (document.documentElement)
  // and runs exactly once on mount with no reactive dependencies to re-track.
  $effect(() => {
    (async () => {
      try {
        const hasConfig = await exists("config.json", { dir: BaseDirectory.AppConfig });
        if (!hasConfig) return;
        const raw = await readTextFile("config.json", { dir: BaseDirectory.AppConfig });
        const config: AppConfig = JSON.parse(raw);
        const html = document.documentElement;
        if (config.theme === "dark") {
          html.classList.add("dark");
        } else if (config.theme === "light") {
          html.classList.remove("dark");
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          prefersDark ? html.classList.add("dark") : html.classList.remove("dark");
        }
      } catch {
        // config unreadable — leave theme as-is
      }
    })();
  });
</script>

{@render children()}
