export async function runPool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {

  const results: T[] = new Array(tasks.length);
  let nextTaskIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextTaskIndex++;
      if (currentIndex >= tasks.length) return;

      const task = tasks[currentIndex];
      results[currentIndex] = await task();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
}
