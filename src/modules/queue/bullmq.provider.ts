import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const notifyQueue = new Queue('ticket-notify', { connection });
export const slaQueue = new Queue('ticket-sla', { connection });
