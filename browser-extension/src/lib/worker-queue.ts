export interface WorkerTask<T> {
  id: string;
  data: T;
}

export class WorkerQueue<T> {
  private maxWorkers: number;
  private workerFunction: (data: T, signal: AbortSignal) => Promise<void>;

  private activeWorkers: Map<string, AbortController> = new Map();
  private queue: WorkerTask<T>[] = [];

  constructor(
    workerFunction: (data: T, signal: AbortSignal) => Promise<void>,
    maxWorkers?: number
  ) {
    this.workerFunction = workerFunction;
    this.maxWorkers = maxWorkers || 3;
  }

  public push(data: T, id?: string): string {
    const taskId = id || crypto.randomUUID();

    this.queue.push({ id: taskId, data });
    this.processNext();
    return taskId;
  }

  public removeTask(id: string): void {
    this.queue = this.queue.filter((task) => task.id !== id);
    const abortController = this.activeWorkers.get(id);
    if (abortController) {
      abortController.abort();
      this.activeWorkers.delete(id);
    }
  }

  private async processNext() {
    if (this.activeWorkers.size >= this.maxWorkers || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    const abortController = new AbortController();
    this.activeWorkers.set(task.id, abortController);

    try {
      await this.workerFunction(task.data, abortController.signal);
    } finally {
      this.activeWorkers.delete(task.id);
      this.processNext();
    }
  }
}
