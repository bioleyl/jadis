import { defineConfig } from 'rolldown';

// Entry points for the main bundle, the JSX runtime and the server render
const entries = [
  { input: 'src/index.ts', name: 'index' },
  { input: 'src/helpers/jsx-runtime.ts', name: 'jsx-runtime' },
  { input: 'src/helpers/jsx-dev-runtime.ts', name: 'jsx-dev-runtime' },
  { input: 'src/server/index.ts', name: 'server' },
];

// Each entry as ESM and as CommonJS. Rolldown strips the types itself: TypeScript 7 has no JavaScript API for a
// bundler to call, and tsc writes the declarations (build:types).
const formats = [
  { dir: 'esm', extension: 'mjs', format: 'esm' },
  { dir: 'cjs', extension: 'js', format: 'cjs' },
];

export default defineConfig(
  entries.flatMap(({ input, name }) =>
    formats.map(({ dir, extension, format }) => ({
      input,
      output: {
        // The declarations hold the documentation: the code keeps only what bundlers read (`@__PURE__`) and licences.
        comments: { annotation: true, jsdoc: false, legal: true },
        file: `dist/${dir}/${name}.${extension}`,
        format,
        sourcemap: true,
      },
      transform: { target: 'es2023' },
      tsconfig: './tsconfig.json',
    }))
  )
);
