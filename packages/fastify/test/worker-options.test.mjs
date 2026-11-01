import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { workerExecArgv } from '../dist/worker-options.js';

describe('workerExecArgv', () => {
  it("lets a worker inherit the process's options, which Node sorts itself", () => {
    assert.deepEqual(workerExecArgv([]), {});
    assert.deepEqual(workerExecArgv(['--enable-source-maps', '--max-old-space-size=512']), {});
  });

  it('starts a worker without options when the process runs a script given as text', () => {
    assert.deepEqual(workerExecArgv(['--input-type=module', '-e', 'run()']), { execArgv: [] });
    assert.deepEqual(workerExecArgv(['--print', '1 + 1']), { execArgv: [] });
    assert.deepEqual(workerExecArgv(['--eval=run()']), { execArgv: [] });
  });
});
