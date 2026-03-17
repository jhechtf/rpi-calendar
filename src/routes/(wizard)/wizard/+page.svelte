<script lang="ts">
  import { goto } from "$app/navigation";
  import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
  import Step from "$lib/components/wizard/step.svelte";
  import Wizard from "$lib/components/wizard/wizard.svelte";
  import { signInWithGoogle } from "$lib/util/google-auth";
  import type { AppConfig, FamilyMember, GoogleAuth, Theme } from "$lib/types/config";
  import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_CLIENT_SECRET } from "$env/static/public";

  // --- Step 1: Google ---
  type GoogleState = "idle" | "loading" | "success" | "error";
  let googleState: GoogleState = $state("idle");
  let googleAuth: GoogleAuth | null = $state(null);
  let googleError = $state("");

  async function connectGoogle() {
    googleState = "loading";
    googleError = "";
    try {
      googleAuth = await signInWithGoogle(PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_CLIENT_SECRET);
      googleState = "success";
    } catch (err) {
      googleError = err instanceof Error ? err.message : String(err);
      googleState = "error";
    }
  }

  function disconnectGoogle() {
    googleAuth = null;
    googleState = "idle";
    googleError = "";
  }

  // --- Step 2: Theme ---
  let theme: Theme = $state("system");

  $effect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      prefersDark ? html.classList.add("dark") : html.classList.remove("dark");
    }
  });

  // --- Step 3: Family members ---
  const palette = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"];
  let familyMembers: FamilyMember[] = $state([]);
  let newName = $state("");
  let newColor = $state(palette[0]);

  function addMember() {
    const name = newName.trim();
    if (!name) return;
    familyMembers = [...familyMembers, { name, color: newColor }];
    newName = "";
    newColor = palette[familyMembers.length % palette.length];
  }

  function removeMember(i: number) {
    familyMembers = familyMembers.filter((_, idx) => idx !== i);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") addMember();
  }

  // --- Finish ---
  async function handleComplete() {
    const config: AppConfig = { theme, familyMembers, googleAuth: googleAuth ?? undefined };
    await writeTextFile("config.json", JSON.stringify(config, null, 2), {
      dir: BaseDirectory.AppConfig,
    });
    goto("/");
  }
</script>

<Wizard oncomplete={handleComplete}>
  <!-- Step 1: Connect Google Calendar -->
  <Step id="google" title="Connect Google">
    <div class="py-6 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Connect Google Calendar</h2>
        <p class="mt-2 text-zinc-500 dark:text-zinc-400">
          Sign in with Google to sync your family's calendars. You can skip this and connect later.
        </p>
      </div>

      {#if googleState === "success" && googleAuth}
        <div class="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <span class="text-green-500 text-2xl">✓</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-green-800 dark:text-green-300 truncate">{googleAuth.name}</p>
            <p class="text-sm text-green-600 dark:text-green-500 truncate">{googleAuth.email}</p>
          </div>
          <button
            onclick={disconnectGoogle}
            class="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
          >
            Disconnect
          </button>
        </div>

      {:else if googleState === "loading"}
        <div class="flex flex-col items-center gap-4 py-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div class="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm text-center">
            A browser tab has opened for Google sign-in.<br />
            Complete the sign-in there, then return here.
          </p>
          <button
            onclick={disconnectGoogle}
            class="text-sm text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
          >
            Cancel
          </button>
        </div>

      {:else}
        {#if googleState === "error"}
          <div class="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            <strong>Sign-in failed:</strong>
            {googleError}
          </div>
        {/if}

        <button
          onclick={connectGoogle}
          class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border
                 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50
                 dark:hover:bg-zinc-700 transition text-zinc-700 dark:text-zinc-200 font-medium"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleState === "error" ? "Try again" : "Sign in with Google"}
        </button>

        <p class="text-sm text-zinc-400 dark:text-zinc-500 text-center">
          You can skip this step and connect later from settings.
        </p>
      {/if}
    </div>
  </Step>

  <!-- Step 2: Theme -->
  <Step id="theme" title="Appearance">
    <div class="py-6 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Choose Your Theme</h2>
        <p class="mt-2 text-zinc-500 dark:text-zinc-400">Pick how you'd like the calendar to look.</p>
      </div>
      <div class="grid grid-cols-3 gap-3">
        {#each [
          { value: "light", label: "Light", icon: "☀️", bg: "bg-white", border: "border-zinc-200" },
          { value: "dark", label: "Dark", icon: "🌙", bg: "bg-zinc-900", border: "border-zinc-700" },
          { value: "system", label: "System", icon: "💻", bg: "bg-gradient-to-br from-white to-zinc-800", border: "border-zinc-300" },
        ] as option}
          <button
            onclick={() => (theme = option.value as Theme)}
            class="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
                   {theme === option.value
              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}"
          >
            <div class="w-full h-16 rounded-lg {option.bg} border {option.border} flex items-center justify-center">
              <span class="text-2xl">{option.icon}</span>
            </div>
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">{option.label}</span>
            {#if theme === option.value}
              <span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </Step>

  <!-- Step 3: Family Members -->
  <Step id="family" title="Family">
    <div class="py-6 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Family Members</h2>
        <p class="mt-2 text-zinc-500 dark:text-zinc-400">
          Add the people whose events should appear on the calendar.
        </p>
      </div>
      <div class="flex gap-2">
        <input
          bind:value={newName}
          onkeydown={handleKeydown}
          placeholder="Name (e.g. Alice)"
          class="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600
                 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100
                 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="color"
          bind:value={newColor}
          title="Pick a calendar colour"
          class="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
        />
        <button
          onclick={addMember}
          disabled={!newName.trim()}
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition
                 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Add
        </button>
      </div>
      {#if familyMembers.length === 0}
        <p class="text-center text-zinc-400 dark:text-zinc-500 py-6 text-sm">
          No family members added yet.
        </p>
      {:else}
        <ul class="space-y-2">
          {#each familyMembers as member, i}
            <li class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span class="w-4 h-4 rounded-full shrink-0" style="background-color: {member.color}"></span>
              <span class="flex-1 font-medium text-zinc-800 dark:text-zinc-100">{member.name}</span>
              <input
                type="color"
                bind:value={member.color}
                title="Change colour"
                class="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
              />
              <button
                onclick={() => removeMember(i)}
                aria-label="Remove {member.name}"
                class="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
              >✕</button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </Step>

  <!-- Step 4: Review -->
  <Step id="review" title="Review">
    <div class="py-6 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">You're all set!</h2>
        <p class="mt-2 text-zinc-500 dark:text-zinc-400">Review your settings before finishing.</p>
      </div>
      <div class="space-y-3">
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <span class="text-xl">{googleAuth ? "✅" : "⏭️"}</span>
          <div class="min-w-0">
            <p class="font-medium text-zinc-800 dark:text-zinc-100 text-sm">Google Calendar</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {googleAuth ? googleAuth.email : "Not connected — you can connect later"}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <span class="text-xl">{theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻"}</span>
          <div>
            <p class="font-medium text-zinc-800 dark:text-zinc-100 text-sm">Theme</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{theme}</p>
          </div>
        </div>
        <div class="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <p class="font-medium text-zinc-800 dark:text-zinc-100 text-sm mb-2">
            Family Members ({familyMembers.length})
          </p>
          {#if familyMembers.length === 0}
            <p class="text-xs text-zinc-400 dark:text-zinc-500">None added</p>
          {:else}
            <div class="flex flex-wrap gap-2">
              {#each familyMembers as m}
                <span
                  class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style="background-color: {m.color}"
                >{m.name}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </Step>
</Wizard>
