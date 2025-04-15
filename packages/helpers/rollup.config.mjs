import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dtsPlugin from 'rollup-plugin-dts';

const dts = dtsPlugin.default || dtsPlugin;

export default [
  // ESM
  {
    input: 'build/index.js',
    output: {
      file: 'dist/index.mjs', // ✅ One single file
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs()],
    external: [],
  },

  // Types
  {
    input: 'build/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
