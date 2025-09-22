import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { QueueService } from '../queue/queue.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, QueueService],
  exports: [TicketsService],
})
export class TicketsModule {}
