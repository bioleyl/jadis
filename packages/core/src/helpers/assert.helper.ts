/**
 * A helper function to assert conditions in the code.
 * It throws an error if the condition is not met.
 * @param condition The condition to check
 * @param message The error message to throw if the condition is not met
 * @throws Will throw an error if the condition is false
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
