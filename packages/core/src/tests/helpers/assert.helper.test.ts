/** biome-ignore-all lint/suspicious/noSelfCompare: We need pointless comparison for thoses tests */
import { describe } from 'vitest';

import { assert } from '../../helpers/assert.helper';

describe('Assert helper', () => {
  it('should assert equality', () => {
    expect(() => assert(1 === 1, '1 should equal 1')).not.toThrow(); // NOSONAR
  });

  it('should assert inequality', () => {
    //@ts-expect-error
    expect(() => assert(1 === 2, '1 should not equal 2')).toThrow(); // NOSONAR
  });
});
