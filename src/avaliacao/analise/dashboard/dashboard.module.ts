import { Module } from '@nestjs/common';

import { TurboModule } from 'src/turbo/turbo.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';


@Module({
  imports: [
    TurboModule,
  ],
  exports: [
    DashboardService,
  ],
  providers: [
    DashboardService,
  ],
  controllers: [
    DashboardController,
  ],
})
export class DashboardModule { }
