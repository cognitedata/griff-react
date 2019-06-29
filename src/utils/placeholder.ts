import { Domain, DomainPriority } from '../external';
import { newDomain } from './domains';

/**
 * Provide a placeholder domain so that we can test for validity later, but
 * it can be safely operated on like a real domain.
 */
export const placeholder = (min: number, max: number): Domain =>
  newDomain(min, max, DomainPriority.PLACEHOLDER);

export const withoutPlaceholder = (
  ...domains: Array<Domain | undefined>
): Domain | undefined => {
  return domains
    .sort((a: Domain | undefined, b: Domain | undefined) => {
      if (a && b) {
        return a.priority - b.priority;
      }

      if (a && !b) {
        return 1;
      } else if (!a && b) {
        return -1;
      }
      return 0;
    })
    .find(domain => !!(domain && domain.priority > DomainPriority.PLACEHOLDER));
};
