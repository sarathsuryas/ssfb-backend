import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';
import { PrismaService } from '../database/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe — verifies the database connection',
  })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
