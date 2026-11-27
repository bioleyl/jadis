/** A promise, and the function that resolves it. */
export interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}
