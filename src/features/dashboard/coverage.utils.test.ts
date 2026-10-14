import { describe, expect, it } from 'vitest';
import { isPointWithinCoverage } from './coverage.utils';

const coverage = {
  enabled: true,
  center: { latitude: 3.45, longitude: -76.53 },
  polygon: [
    { latitude: 3.44, longitude: -76.54 },
    { latitude: 3.44, longitude: -76.52 },
    { latitude: 3.46, longitude: -76.52 },
    { latitude: 3.46, longitude: -76.54 }
  ]
};

describe('company coverage boundary', () => {
  it('accepts locations inside the configured delivery area', () => {
    expect(isPointWithinCoverage({ latitude: 3.45, longitude: -76.53 }, coverage)).toBe(true);
  });

  it('rejects locations outside the configured delivery area', () => {
    expect(isPointWithinCoverage({ latitude: 3.5, longitude: -76.6 }, coverage)).toBe(false);
  });
});
