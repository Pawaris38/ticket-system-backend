import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';

@Controller('admin/queues')
export class AdminController {
  constructor(private readonly queueService: QueueService) {}

  @Get(':name/stats')
  async getQueueStats(@Param('name') name: string) {
    if (!['ticket-notify', 'ticket-sla'].includes(name)) {
      throw new NotFoundException(`Queue ${name} not found`);
    }
    return this.queueService.getStats(name);
  }
}
