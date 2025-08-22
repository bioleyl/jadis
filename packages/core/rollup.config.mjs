import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

export default [
  // ESM
  {
    external: [],
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ declaration: false, tsconfig: './tsconfig.json' }),
      del({ runOnce: true, targets: 'dist/esm' }),
    ],
  },

  // CJS
  {
    external: [],
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ declaration: false, tsconfig: './tsconfig.json' }),
      del({ runOnce: true, targets: 'dist/cjs' }),
    ],
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
      del({ runOnce: true, targets: 'dist/types' }),
      del({ hook: 'buildEnd', targets: 'dist/dts' }),
    ],
  },
];
