import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Ddi } from './modelo/ddi.entity';
import { DdiService } from './ddi.service';
import { DdiController } from './ddi.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Ddi], 'gravacao'),
    TypeOrmModule.forFeature([Ddi], 'leitura'),
    TurboModule,
  ],
  exports: [
    DdiService,
  ],
  providers: [
    DdiService,
  ],
  controllers: [
    DdiController,
  ],
})
export class DdiModule { }
