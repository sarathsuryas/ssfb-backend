import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService, type PublicUser } from './users.service.js';

@ApiTags('staff')
@Controller('staff')
@Roles(Role.ADMIN, Role.STAFF)
export class StaffController {
  constructor(private readonly usersService: UsersService) {}

  @Post('customers')
  @ApiOperation({ summary: 'Create a customer account (admin or staff)' })
  createCustomer(@CurrentUser() actor: PublicUser, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(actor, Role.CUSTOMER, dto);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customer accounts (admin or staff)' })
  listCustomers() {
    return this.usersService.findByRole(Role.CUSTOMER);
  }
}
