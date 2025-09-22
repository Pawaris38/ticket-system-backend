import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'title must be at least 5 characters long' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'description must not exceed 5000 characters' })
  description?: string;

  @IsEnum(Priority, { message: 'priority must be LOW | MEDIUM | HIGH' })
  priority: Priority;

  @IsEnum(Status, {
    message: 'status must be OPEN | IN_PROGRESS | RESOLVED',
  })
  status: Status;
}
