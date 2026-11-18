import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { StaffAccountsController } from './staff-accounts.controller.js';

@Module({
  controllers: [StaffAccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
