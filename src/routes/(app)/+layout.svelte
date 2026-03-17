<script lang="ts">
  import type { Snippet } from "svelte";
  import Navigation from "$lib/components/navigation.svelte";
  import "../../app.css";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<Navigation />
{@render children()}
