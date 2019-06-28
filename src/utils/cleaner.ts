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

/**
 * Return the first thing which is not `undefined`.
 * @param {*} first
 * @param  {...any} others
 */
// @ts-ignore
export const firstDefined = (first: any, ...others: Array<any | undefined>) => {
  if (first !== undefined || others.length === 0) {
    return first;
  }
  return firstDefined(others[0], ...others.splice(1));
};
