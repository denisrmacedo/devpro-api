import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Auditoria } from './modelo/auditoria.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auditoria], 'gravacao'),
    TypeOrmModule.forFeature([Auditoria], 'leitura'),
    TurboModule,
  ],
  exports: [
    AuditoriaService,
  ],
  providers: [
    AuditoriaService,
  ],
  controllers: [
    AuditoriaController,
  ],
})
export class AuditoriaModule { }
