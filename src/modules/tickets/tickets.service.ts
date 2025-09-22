import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Priority, Prisma, Status } from '@prisma/client';
@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async create(dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({ data: dto });

    await this.queueService.enqueueNotify(ticket);
    await this.queueService.enqueueSla(ticket);

    return ticket;
  }

  async findAll(params: {
    status?: string;
    priority?: string;
    search?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { status, priority, search, page, pageSize, sortBy, sortOrder } =
      params;

    const where: Prisma.TicketWhereInput = {};
    if (status) where.status = status as Status;
    if (priority) where.priority = priority as Priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException();
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: dto,
    });

    if (dto.status === Status.RESOLVED) {
      await this.queueService.removeSlaJob(id);
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();

    await this.queueService.removeSlaJob(id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}
