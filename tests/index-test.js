import expect from 'expect';
import { DataProvider } from 'src/';

const { getSubDomain } = DataProvider;

describe('getSubDomain', () => {
  it('handles the base case', () => {
    const baseDomain = [0, 100];
    const subDomain = [25, 75];
    expect(getSubDomain(baseDomain, subDomain)).toMatch(subDomain);
  });

  it('handles when the subdomain goes longer', () => {
    const baseDomain = [50, 100];
    const subDomain = [95, 105];
    expect(getSubDomain(baseDomain, subDomain)).toMatch([90, 100]);
  });

  it('handles when the subdomain goes shorter', () => {
    const baseDomain = [50, 100];
    const subDomain = [45, 55];
    expect(getSubDomain(baseDomain, subDomain)).toMatch([50, 60]);
  });

  it('handles when the subdomain is outside', () => {
    const baseDomain = [50, 100];
    const subDomain = [150, 160];
    expect(getSubDomain(baseDomain, subDomain)).toMatch([90, 100]);
  });

  it('handles when the subdomain is longer than the domain', () => {
    const baseDomain = [50, 100];
    const subDomain = [25, 125];
    expect(getSubDomain(baseDomain, subDomain)).toMatch([50, 100]);
  });
});
