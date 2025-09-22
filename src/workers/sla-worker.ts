import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const connection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null,
  },
);

type SlaJobData = {
  ticketId: string;
};

new Worker<SlaJobData>(
  'ticket-sla',
  async (job: Job<SlaJobData>) => {
    const { ticketId } = job.data;
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return;
    if (ticket.status !== 'RESOLVED') {
      console.warn(`⚠️ SLA breach for ticket ${ticketId}`);
    }
  },
  { connection },
);
