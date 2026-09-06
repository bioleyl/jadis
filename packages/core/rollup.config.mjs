import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';

// Entry points for the main bundle and JSX runtime
const entries = [
  { input: 'src/index.ts', name: 'index' },
  { input: 'src/helpers/jsx-runtime.ts', name: 'jsx-runtime' },
  { input: 'src/helpers/jsx-dev-runtime.ts', name: 'jsx-dev-runtime' },
];

export default entries.flatMap(({ input, name }) => [
  // ESM
  {
    external: [],
    input,
    output: {
      file: `dist/esm/${name}.mjs`,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ declaration: false, tsconfig: './tsconfig.json' }),
      del({ runOnce: true, targets: `dist/esm/${name}*` }),
    ],
  },

  // CJS
  {
    external: [],
    input,
    output: {
      file: `dist/cjs/${name}.js`,
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ declaration: false, tsconfig: './tsconfig.json' }),
      del({ runOnce: true, targets: `dist/cjs/${name}*` }),
    ],
  },
]);
