import { highestPriorityDomain, newDomain } from '../build/src/utils/domains';
import { DomainPriority } from '../build/src/external';

expect.extend({
  toMatchDomain(received, expected) {
    const pass =
      received[0] === expected[0] &&
      received[1] === expected[1] &&
      received.priority === expected.priority;
    if (pass) {
      return {
        message: () => `expected ${received} not to be ${expected}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be ${expected}`,
      pass: false,
    };
  },
});

describe('domains.ts', () => {
  describe('newDomain', () => {
    expect(newDomain(0, 1, DomainPriority.PLACEHOLDER).toString()).toMatch('');
  });

  describe('highestPriorityDomain', () => {
    it('handles all undefined', () => {
      expect(highestPriorityDomain(undefined, undefined)).toEqual(undefined);
    });

    it('sorts correctly', () => {
      expect(
        highestPriorityDomain(
          newDomain(0, 1, DomainPriority.USER_GENERATED),
          newDomain(1, 2, DomainPriority.PLACEHOLDER)
        )
      ).toMatchDomain(newDomain(0, 1, DomainPriority.USER_GENERATED));

      expect(
        highestPriorityDomain(
          newDomain(1, 2, DomainPriority.PLACEHOLDER),
          newDomain(0, 1, DomainPriority.USER_GENERATED)
        )
      ).toMatchDomain(newDomain(0, 1, DomainPriority.USER_GENERATED));
    });

    it('handles a mixed list', () => {
      expect(
        highestPriorityDomain(
          newDomain(0, 1, DomainPriority.USER_GENERATED),
          undefined,
          newDomain(1, 2, DomainPriority.PLACEHOLDER)
        )
      ).toMatchDomain(newDomain(0, 1, DomainPriority.USER_GENERATED));

      expect(
        highestPriorityDomain(
          newDomain(1, 2, DomainPriority.PLACEHOLDER),
          undefined,
          newDomain(0, 1, DomainPriority.USER_GENERATED)
        )
      ).toMatchDomain(newDomain(0, 1, DomainPriority.USER_GENERATED));
    });
  });
});
