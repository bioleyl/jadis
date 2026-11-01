import { defineConfig } from 'vite';

// Two builds: the page the browser loads (dist/client), and the render the server runs (dist/server).
export default defineConfig(({ isSsrBuild }) => ({
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
  },
  // The files of public/ are the browser's.
  publicDir: isSsrBuild ? false : 'public',
  // The server bundle holds the app's code and Jadis: @jadis/fastify's workers set up the DOM before loading it.
  ssr: { noExternal: true },
}));
