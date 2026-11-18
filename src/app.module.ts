import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
