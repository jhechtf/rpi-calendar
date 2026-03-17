<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Snippet } from "svelte";
  import type { WizardContext } from "./wizard";
  import { fly } from "svelte/transition";

  interface Props {
    id: string;
    title?: string;
    children: Snippet;
  }

  let { id, title = "", children }: Props = $props();

  const ctx = getContext<WizardContext>("wizard");

  // onMount avoids the infinite loop that $effect causes here: $effect tracks
  // all reactive reads during its execution, including those inside
  // registerStep (which reads then writes state.steps), causing it to re-fire
  // endlessly. onMount has no reactive tracking — it runs once after mount.
  onMount(() => {
    ctx.registerStep(id, title);
    return () => ctx.unregisterStep(id);
  });
</script>

{#if ctx.state.active === id}
  <div in:fly={{ duration: 300, x: 40, opacity: 0 }}>
    {@render children()}
  </div>
{/if}
