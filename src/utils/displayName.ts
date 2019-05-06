export function withDisplayName<T extends {}>(
  displayName: string,
  Component: T
): T {
  // @ts-ignore - I don't know what T needs to be to allow this to work.
  Component.displayName = displayName;
  return Component;
}
