import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator.js';

@ApiTags('app')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Service metadata' })
  info() {
    return { name: 'ssfb-backend', version: '0.0.1', docs: '/docs' };
  }
}
