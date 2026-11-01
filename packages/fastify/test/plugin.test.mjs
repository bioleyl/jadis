import assert from 'node:assert/strict';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import Fastify from 'fastify';

import jadis from '../dist/index.js';

const FIXTURE = join(import.meta.dirname, 'fixture');
const WORKERS = 2;
const CONCURRENT_PAGES = 12;

describe('@jadis/fastify', () => {
  const app = Fastify();
  let base = '';

  before(async () => {
    app.get('/api/hello', async () => ({ message: 'hello from the API' }));
    await app.register(jadis, {
      entry: 'src/entry-server.ts',
      preHandler: async (request, reply) => {
        if (request.url.startsWith('/private') && request.headers['x-user'] === undefined) {
          await reply.redirect('/login');
        }
      },
      requestData: (request) => ({ user: request.headers['x-user'] }),
      root: FIXTURE,
      workers: WORKERS,
    });
    await app.listen({ host: '127.0.0.1', port: 0 });
    base = `http://127.0.0.1:${app.server.address().port}`;
  });

  after(() => app.close());

  const page = async (path, headers = {}) => {
    const response = await fetch(`${base}${path}`, { headers, redirect: 'manual' });
    return { html: await response.text(), response };
  };

  it("renders a GET no route answers in the page's shell, with its head, status and headers", async () => {
    const { html, response } = await page('/hello?x=1');

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/html/);
    assert.equal(response.headers.get('x-rendered'), 'yes');
    assert.match(html, /<title>Fixture<\/title>/);
    assert.match(html, /<div id="app"><p part="greeting">\/hello\?x=1 for nobody<\/p>/);
  });

  it("leaves the app's own routes to the app", async () => {
    const response = await fetch(`${base}/api/hello`);

    assert.deepEqual(await response.json(), { message: 'hello from the API' });
  });

  it("gives the render Node's fetch and the server's address, and refuses a component's own fetch", async () => {
    const { html } = await page('/hello');

    assert.match(html, /<span class="api">hello from the API<\/span>/);
    assert.match(html, /<span class="fetch">refused<\/span>/);
  });

  it('passes what requestData takes from the request, after the preHandler', async () => {
    const { html } = await page('/private', { 'x-user': 'ada' });
    const { response } = await page('/private');

    assert.match(html, /\/private for ada/);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/login');
  });

  it("answers with the render's status", async () => {
    const { response } = await page('/missing');

    assert.equal(response.status, 404);
  });

  it("serves the build's files, but never the shell as it is", async () => {
    const script = await page('/assets/app.js');
    const shell = await page('/index.html');

    assert.equal(script.response.status, 200);
    assert.match(script.html, /export const fixture = true/);
    assert.doesNotMatch(shell.html, /<!--app-body-->/);
  });

  it('answers a file missing from the build with a 404, not a page', async () => {
    const { html, response } = await page('/assets/missing.js');

    assert.equal(response.status, 404);
    assert.doesNotMatch(html, /<title>Fixture<\/title>/);
  });

  it('answers a failed render with a 500, and renders the next page as usual', async () => {
    const failed = await page('/boom');
    const next = await page('/after');

    assert.equal(failed.response.status, 500);
    assert.equal(next.response.status, 200);
    assert.match(next.html, /\/after for nobody/);
  });

  it('renders many pages at once across its workers, each with its own request', async () => {
    const users = Array.from({ length: CONCURRENT_PAGES }, (_, index) => `user-${index}`);
    const pages = await Promise.all(users.map((user) => page('/hello', { 'x-user': user })));

    pages.forEach(({ html }, index) => assert.match(html, new RegExp(`/hello for ${users[index]}<`)));
  });
});
