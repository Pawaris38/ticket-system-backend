import { Injectable, Logger } from '@nestjs/common';
import { notifyQueue, slaQueue } from './bullmq.provider';
import { Ticket } from '@prisma/client';
@Injectable()
export class QueueService {
  private readonly logger = new Logger('QueueService');

  async enqueueNotify(ticket: Ticket) {
    await notifyQueue.add(
      'ticket-notify',
      { ticketId: ticket.id },
      {
        jobId: `notify:${ticket.id}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
  }

  async enqueueSla(ticket: Ticket, delayMs = 15 * 60 * 1000) {
    await slaQueue.add(
      'ticket-sla',
      { ticketId: ticket.id },
      {
        jobId: `sla:${ticket.id}`,
        delay: delayMs,
        removeOnComplete: true,
      },
    );
  }

  async removeSlaJob(ticketId: string) {
    const jobId = `sla:${ticketId}`;
    const job = await slaQueue.getJob(jobId);

    if (job) {
      await job.remove();
      console.log(`✅ Removed SLA job: ${jobId}`);
    } else {
      console.log(`⚠️ SLA job not found: ${jobId}`);
    }
  }

  async listJobs() {
    return {
      notify: {
        stats: await this.getStats('ticket-notify'),
        waiting: await notifyQueue.getWaiting(),
        delayed: await notifyQueue.getDelayed(),
      },
      sla: {
        stats: await this.getStats('ticket-sla'),
        waiting: await slaQueue.getWaiting(),
        delayed: await slaQueue.getDelayed(),
      },
    };
  }

  async getStats(name: string) {
    const q = name === 'ticket-sla' ? slaQueue : notifyQueue;
    return q.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    );
  }
}
