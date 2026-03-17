<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import type { WizardContext, WizardState } from "./wizard";

  interface Props {
    children: Snippet;
    oncomplete?: () => void;
  }

  let { children, oncomplete }: Props = $props();

  // A single $state object whose properties remain reactive across the context
  // boundary. Child components read ctx.state.active / ctx.state.steps directly.
  const state: WizardState = $state({ active: "", steps: [] });

  const currentIndex = $derived(state.steps.findIndex((s) => s.id === state.active));
  const isFirst = $derived(currentIndex <= 0);
  const isLast = $derived(currentIndex === state.steps.length - 1 && state.steps.length > 0);

  function next() {
    if (!isLast) state.active = state.steps[currentIndex + 1].id;
  }

  function prev() {
    if (!isFirst) state.active = state.steps[currentIndex - 1].id;
  }

  setContext<WizardContext>("wizard", {
    state,
    registerStep(id, title) {
      if (state.steps.find((s) => s.id === id)) {
        throw new Error(`Step "${id}" is already registered`);
      }
      state.steps = [...state.steps, { id, title }];
      if (state.active === "") state.active = id;
    },
    unregisterStep(id) {
      state.steps = state.steps.filter((s) => s.id !== id);
    },
    next,
    prev,
  });
</script>

<div class="min-h-screen flex flex-col bg-white dark:bg-zinc-900 transition-colors">
  <!-- Progress indicator -->
  <div class="flex items-center justify-center gap-1 pt-10 pb-6 px-4">
    {#each state.steps as step, i}
      <div class="flex items-center gap-1">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
            {i < currentIndex
            ? 'bg-blue-600 text-white'
            : i === currentIndex
              ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900'
              : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}"
        >
          {#if i < currentIndex}✓{:else}{i + 1}{/if}
        </div>
        <span
          class="text-sm hidden sm:block
            {i === currentIndex
            ? 'text-zinc-800 dark:text-zinc-100 font-medium'
            : 'text-zinc-400 dark:text-zinc-500'}"
        >
          {step.title}
        </span>
        {#if i < state.steps.length - 1}
          <div
            class="w-6 h-0.5 mx-1 {i < currentIndex
              ? 'bg-blue-600'
              : 'bg-zinc-200 dark:bg-zinc-700'}"
          ></div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Step content -->
  <div class="flex-1 container mx-auto px-4 max-w-lg w-full">
    {@render children()}
  </div>

  <!-- Navigation buttons -->
  <div class="flex justify-between items-center px-4 py-8 container mx-auto max-w-lg w-full">
    <button
      onclick={prev}
      disabled={isFirst}
      class="px-6 py-2 rounded-lg border border-zinc-300 text-zinc-600 disabled:opacity-30
             hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
    >
      Back
    </button>

    {#if isLast}
      <button
        onclick={oncomplete}
        class="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
      >
        Finish Setup
      </button>
    {:else}
      <button
        onclick={next}
        class="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
      >
        Next
      </button>
    {/if}
  </div>
</div>
