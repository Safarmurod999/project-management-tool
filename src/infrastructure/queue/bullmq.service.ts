import { Injectable, Inject } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { Cache } from '../cache/cache';
import { CacheSymbols } from '../dependency-injection';
import { ConfigSymbols } from '../dependency-injection';

@Injectable()
export class BullMQService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(
    @Inject(CacheSymbols.RedisCache)
    private readonly cache: Cache,
  ) {}

  /**
   * Create a new queue
   */
  createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: this.cache.client,
      defaultJobOptions: {
        removeOnComplete: 100, // Keep only last 100 completed jobs
        removeOnFail: 50,      // Keep only last 50 failed jobs
        attempts: 3,           // Retry failed jobs 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,         // Initial delay of 2 seconds
        },
      },
    });

    this.queues.set(queueName, queue);
    return queue;
  }

  /**
   * Get an existing queue
   */
  getQueue(queueName: string): Queue | undefined {
    return this.queues.get(queueName);
  }

  /**
   * Create a worker for processing jobs
   */
  createWorker(
    queueName: string,
    processor: (job: Job) => Promise<void>,
    options: { concurrency?: number } = {}
  ): Worker {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker for queue ${queueName} already exists`);
    }

    const worker = new Worker(queueName, processor, {
      connection: this.cache.client,
      concurrency: options.concurrency || 5, // Process 5 jobs concurrently by default
    });

    // Event handlers for monitoring
    worker.on('completed', (job) => {
      console.log(`Job ${job.id} in queue ${queueName} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} in queue ${queueName} failed:`, err.message);
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName: string, jobName: string, data: any, options: any = {}): Promise<Job> {
    const queue = this.getQueue(queueName) || this.createQueue(queueName);
    return queue.add(jobName, data, options);
  }

  /**
   * Close all queues and workers
   */
  async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    // Close workers
    for (const [queueName, worker] of this.workers) {
      console.log(`Closing worker for queue ${queueName}`);
      closePromises.push(worker.close());
    }

    // Close queues
    for (const [queueName, queue] of this.queues) {
      console.log(`Closing queue ${queueName}`);
      closePromises.push(queue.close());
    }

    await Promise.all(closePromises);

    this.queues.clear();
    this.workers.clear();
  }
}