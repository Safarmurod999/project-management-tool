export interface TransactionManager {
  /**
   * Runs `work` atomically. Every repository call awaited inside `work`
   * participates in the same transaction; any thrown error rolls it back.
   */
  run<T>(work: () => Promise<T>): Promise<T>;
}
