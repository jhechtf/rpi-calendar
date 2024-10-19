<script lang="ts">
  import { goto } from "$app/navigation";
  import { exists, BaseDirectory } from "@tauri-apps/api/fs";
  import { onMount } from "svelte";
  onMount(async () => {
    const e = await exists("config.json", {
      dir: BaseDirectory.AppConfig,
    });
    if (!e) {
      goto("/wizard");
    }
  });
</script>

<div class="bg-blue-400">hi</div>
