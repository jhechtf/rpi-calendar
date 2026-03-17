export interface WizardStep {
  id: string;
  title: string;
}

/**
 * A plain reactive object created with $state() in wizard.svelte and passed
 * through Svelte context. Because it is a $state proxy, mutations to
 * state.active and state.steps are tracked by Svelte 5's fine-grained
 * reactivity system even after the object is retrieved via getContext() in
 * child components — no stores needed.
 */
export interface WizardState {
  active: string;
  steps: WizardStep[];
}

export interface WizardContext {
  /** Reactive state — read state.active and state.steps directly in templates. */
  state: WizardState;
  registerStep(id: string, title: string): void;
  unregisterStep(id: string): void;
  next(): void;
  prev(): void;
}
