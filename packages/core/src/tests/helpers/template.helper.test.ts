/** biome-ignore-all lint/style/noNonNullAssertion: It cannot infer that a div exist based on the previous assertion */
import { describe, expect, it } from 'vitest';

import { css } from '../../helpers/template.helper.js';

describe('Template helper', () => {
  describe('css', () => {
    it('should create a string with the given CSS rules', () => {
      const cssTemplate = `
        .my-class {
          color: red;
        }
      `;
      const style = css`${cssTemplate}`;
      expect(style).toBe(cssTemplate);
    });

    it('should create a string with the given CSS rules and accept interpolation', () => {
      const color = 'red';
      const style = css`
          .my-class {
            color: ${color};
          }
        `;
      expect(style).toBe(`
          .my-class {
            color: red;
          }
        `);
    });
  });
});
