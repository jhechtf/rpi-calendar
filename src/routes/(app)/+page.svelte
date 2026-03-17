<script lang="ts">
  import { goto } from "$app/navigation";
  import { exists, BaseDirectory } from "@tauri-apps/api/fs";

  // $effect runs after mount — equivalent to onMount for DOM-side async work.
  $effect(() => {
    exists("config.json", { dir: BaseDirectory.AppConfig }).then((e) => {
      if (!e) goto("/wizard");
    });
  });
</script>

<div class="bg-blue-400">hi</div>
