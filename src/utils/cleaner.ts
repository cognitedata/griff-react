export function deleteUndefinedFromObject<T extends {}>(obj: T): T {
  const copy = { ...obj };
  Object.keys(copy).forEach(key => {
    // @ts-ignore - Implicit any is okay here.
    if (copy[key] === undefined) {
      // @ts-ignore - Implicit any is okay here.
      delete copy[key];
    }
  });
  return copy;
}
