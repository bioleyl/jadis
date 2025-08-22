import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';

export default [
  // ESM
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      del({ targets: 'dist/esm', runOnce: true }),
    ],
    external: [],
  },

  // CJS
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
      del({ targets: 'dist/cjs', runOnce: true }),
    ],
    external: [],
  },

  // Types
  {
    input: 'dist/dts/index.d.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts(),
      del({ targets: 'dist/types', runOnce: true }),
      del({ hook: 'buildEnd', targets: 'dist/dts' }),
    ],
  },
];
