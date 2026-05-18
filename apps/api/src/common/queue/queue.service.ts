import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, type Job } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };

  private queues = new Map<string, Queue>();

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, { connection: this.connection });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  createWorker(
    name: string,
    processor: (job: Job) => Promise<void>,
  ): Worker {
    const worker = new Worker(name, processor, { connection: this.connection });
    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed in queue ${name}`);
    });
    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed in queue ${name}: ${err.message}`);
    });
    return worker;
  }
}
