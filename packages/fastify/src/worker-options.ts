/** Node's options for a script given as text (`node -e …`, `--input-type`), which a worker started from a file refuses. */
const TEXT_SCRIPT_OPTIONS = ['-e', '--eval', '-p', '--print', '--input-type'];

const isTextScriptOption = (option: string): boolean =>
  TEXT_SCRIPT_OPTIONS.some((name) => option === name || option.startsWith(`${name}=`));

/**
 * The Node options a worker starts with. By default, none given: the worker inherits the process's, Node leaving out
 * those that belong to the whole process (`--max-old-space-size`). A process running a script given as text has
 * options a worker refuses, and a list given explicitly is checked strictly: the worker then starts without any.
 * @param execArgv The process's options (`process.execArgv`)
 * @returns The worker's `execArgv` option, or nothing to inherit
 */
export function workerExecArgv(execArgv: readonly string[]): { execArgv?: string[] } {
  return execArgv.some(isTextScriptOption) ? { execArgv: [] } : {};
}
