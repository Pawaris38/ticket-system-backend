import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null,
  },
);
interface NotifyJobData {
  ticketId: string;
}

new Worker<NotifyJobData>(
  'ticket-notify',
  async (job: Job<NotifyJobData>) => {
    console.log(`Notify job for ticket ${job.data.ticketId}`);
    return Promise.resolve();
  },
  { connection },
);
