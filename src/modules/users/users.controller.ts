import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
@Roles(Role.ADMIN, Role.STAFF)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'List registered users' })
  list() {
    return this.usersService.findMany();
  }
}
