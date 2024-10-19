import type { Writable } from "svelte/store";

export interface WizardContext {
  registerStep(id: string, title: string): void;
  unregisterStep(id: string): void;
  getActiveStore: () => Writable<string>;
}
