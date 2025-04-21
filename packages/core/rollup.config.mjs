import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dtsPlugin from 'rollup-plugin-dts';

const dts = dtsPlugin.default || dtsPlugin;
const name = 'Jadis';

export default [
  // ESM
  {
    input: 'build/index.js',
    output: {
      file: 'dist/esm/index.mjs', // ✅ One single file
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs()],
    external: [],
  },

  // CJS
  {
    input: 'build/index.js',
    output: {
      file: 'dist/cjs/index.js', // ✅ One single file
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs()],
    external: [],
  },

  // UMD stays the same
  {
    input: 'build/index.js',
    output: {
      file: 'dist/umd/index.js',
      format: 'umd',
      name,
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), terser()],
    external: [],
  },

  // Types
  {
    input: 'build/index.d.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
