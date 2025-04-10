import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Cnae } from './modelo/cnae.entity';
import { CnaeService } from './cnae.service';
import { CnaeController } from './cnae.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Cnae], 'gravacao'),
    TypeOrmModule.forFeature([Cnae], 'leitura'),
    TurboModule,
  ],
  exports: [
    CnaeService,
  ],
  providers: [
    CnaeService,
  ],
  controllers: [
    CnaeController,
  ],
})
export class CnaeModule { }
