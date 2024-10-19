<script lang="ts">
  import { setContext } from "svelte";
  import type { WizardContext } from "./wizard";
  import { writable } from "svelte/store";

  let steps: Record<string, { title: string; id: string }> = {};
  let orderedSteps: string[] = [];

  const active = writable("");

  setContext<WizardContext>("wizard", {
    getActiveStore: () => active,
    registerStep: (id, title) => {
      if (steps[id]) {
        throw new Error("Cannot add this element; key already exists");
      }

      steps[id] = {
        title,
        id,
      };
      orderedSteps.push(id);

      if ($active === "" && orderedSteps.length) {
        $active = orderedSteps[0];
      }
    },
    unregisterStep: (id: string) => {
      if (steps[id]) delete steps[id];
      orderedSteps = orderedSteps.filter((step) => step !== id);
    },
  });
</script>

<div class="container mx-auto overflow-hidden">
  <header class="flex gap-2" role="tablist">
    {#each Object.entries(steps) as [id, value]}
      <div
        class="p-2 rounded"
        class:active={$active === id}
        tabindex="0"
        role="tab"
        aria-roledescription="button"
        on:click={() => {
          $active = id;
        }}
        on:keyup={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            $active = id;
          }
        }}
      >
        {value.title}
      </div>
    {/each}
  </header>
  <slot />
</div>

<style lang="scss">
  div[role="tab"] {
    &.active:hover {
      background-color: theme("colors.blue.500");
    }
    &:hover {
      background-color: theme("colors.zinc.700");
    }
  }
  div.active {
    background-color: theme("colors.blue.600");
  }
</style>
