import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { StaffController } from './staff.controller.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController, AdminController, StaffController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
