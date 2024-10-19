<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { WizardContext } from "./wizard";
  import type { Writable } from "svelte/store";
  import { fly } from "svelte/transition";

  export let id: string;
  export let title: string = "";

  const wizardContext = getContext<WizardContext>("wizard");
  let activeStore: Writable<string>;

  onMount(() => {
    wizardContext.registerStep(id, title);
    activeStore = wizardContext.getActiveStore();
    return () => {
      wizardContext.unregisterStep(id);
    };
  });
</script>

{#if $activeStore === id}
  <div in:fly={{ duration: 400, x: "100vw" }}>
    <slot />
  </div>
{/if}
