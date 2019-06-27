import { Domain } from '../external';

/**
 * Provide a placeholder domain so that we can test for validity later, but
 * it can be safely operated on like a real domain.
 */
export const placeholder = (min: number, max: number): Domain => {
  const domain: Domain = [min, max];
  domain.placeholder = true;
  return domain;
};

export const withoutPlaceholder = (
  ...domains: Array<Domain | undefined>
): Domain | undefined => {
  for (let i = 0; i < domains.length; i += 1) {
    const domain = domains[i];
    if (domain && !domain.placeholder) {
      return domain;
    }
  }
  return undefined;
};
