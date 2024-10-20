<script lang="ts">
  import { goto } from "$app/navigation";
  import { exists, BaseDirectory } from "@tauri-apps/plugin-fs";
  import { onMount } from "svelte";
  onMount(async () => {
    const e = await exists("config.json", {
      baseDir: BaseDirectory.AppConfig,
    });
    console.info(e);
    if (!e) {
      goto("/wizard");
    }
  });
</script>

hello?