export interface CreateFormArgs<T extends Record<string, unknown>> {
  initialValues: T;
}

export function createForm<T extends Record<string, unknown>>(
  args: CreateFormArgs<T>,
) {
  console.info("hi", args);
}
