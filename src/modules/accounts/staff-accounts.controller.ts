import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import type { PublicUser } from '../users/users.service.js';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';

@ApiTags('accounts')
@Controller('staff/accounts')
@Roles(Role.ADMIN, Role.STAFF)
export class StaffAccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Open a bank account for a customer (admin or staff)',
  })
  create(@CurrentUser() actor: PublicUser, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(actor, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank accounts (admin or staff)' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Only return accounts owned by this customer',
  })
  list(@Query('customerId') customerId?: string) {
    return this.accountsService.findAll(customerId);
  }
}
