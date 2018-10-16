import expect from 'expect';
import { DataProvider } from 'src/';

const { getXSubDomain } = DataProvider;

const limitXSubDomain = xSubDomain => xSubDomain;

const limitXSubDomain2 = xSubDomain => {
  const xSubDomainLength = xSubDomain[1] - xSubDomain[0];
  const xSubDomainEnd = Math.min(90, xSubDomain[1]);
  return [xSubDomainEnd - xSubDomainLength, xSubDomainEnd];
};

describe('getXSubDomain', () => {
  it('handles the base case', () => {
    const xDomain = [0, 100];
    const xSubDomain = [25, 75];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain)).toMatch(
      xSubDomain
    );
  });

  it('handles when the subdomain goes longer', () => {
    const xDomain = [50, 100];
    const xSubDomain = [95, 105];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain)).toMatch([
      90,
      100,
    ]);
  });

  it('handles when the subdomain goes shorter', () => {
    const xDomain = [50, 100];
    const xSubDomain = [45, 55];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain)).toMatch([
      50,
      60,
    ]);
  });

  it('handles when the subdomain is outside', () => {
    const xDomain = [50, 100];
    const xSubDomain = [150, 160];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain)).toMatch([
      90,
      100,
    ]);
  });

  it('handles when the subdomain is longer than the domain', () => {
    const xDomain = [50, 100];
    const xSubDomain = [25, 125];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain)).toMatch([
      50,
      100,
    ]);
  });

  it('handles limitXSubDomain', () => {
    const xDomain = [50, 100];
    const xSubDomain = [95, 105];
    expect(getXSubDomain(xDomain, xSubDomain, limitXSubDomain2)).toMatch([
      80,
      90,
    ]);
  });
});
