import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService, type PublicUser } from './users.service.js';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('staff')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a staff account (admin only)' })
  createStaff(@CurrentUser() actor: PublicUser, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(actor, Role.STAFF, dto);
  }
}
