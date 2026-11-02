import assert from 'node:assert/strict';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { RenderPool } from '../dist/render-pool.js';

const ENTRY = join(import.meta.dirname, 'fixture', 'dist', 'server', 'entry-server.js');
const MISSING_ENTRY = join(import.meta.dirname, 'fixture', 'dist', 'server', 'missing.js');
// Long enough for a worker to start on a slow machine, short enough to wait for in a test.
const TIMEOUT_MS = 1000;

const job = (url) => ({ origin: 'http://localhost', request: undefined, url });

describe('RenderPool', () => {
  const pools = [];
  const createPool = (entry = ENTRY) => {
    const pool = new RenderPool(entry, 1, TIMEOUT_MS);
    pools.push(pool);
    return pool;
  };

  afterEach(() => Promise.all(pools.splice(0).map((pool) => pool.close())));

  it('fails a render that takes longer than the timeout, and renders the next page as usual', async () => {
    const pool = createPool();
    await pool.render(job('/styled'));

    await assert.rejects(pool.render(job('/never')), /the render of \/never took over 1000 ms/);
    const next = await pool.render(job('/styled'));

    assert.match(next.response.body, /<p>styled<\/p>/);
  });

  it('fails the renders of a worker that exits, and puts a new worker in its place', async () => {
    const pool = createPool();
    await pool.render(job('/styled'));

    const waiting = pool.render(job('/never'));
    await assert.rejects(pool.render(job('/exit')), /exit code 1/);
    await assert.rejects(waiting, /exit code 1/);
    const next = await pool.render(job('/styled'));

    assert.match(next.response.body, /<p>styled<\/p>/);
  });

  it('fails the renders it still holds when it closes, the ones waiting for a worker to start included', async () => {
    const pool = createPool();
    const waiting = assert.rejects(pool.render(job('/styled')), /the render workers stopped before the page was rendered/);
    await pool.close();

    await waiting;
  });

  it('fails the renders of a worker that could not load the server entry', async () => {
    const pool = createPool(MISSING_ENTRY);

    await assert.rejects(pool.render(job('/styled')), /missing\.js/);
    await assert.rejects(pool.render(job('/styled')), /missing\.js/);
  });
});
