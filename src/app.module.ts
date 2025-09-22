import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './modules/tickets/tickets.module';
import { QueueModule } from './modules/queue/queue.module';
import { AdminController } from './modules/admin/admin.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [TicketsModule, QueueModule, PrismaModule],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {}
