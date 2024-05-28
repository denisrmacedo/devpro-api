import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssistenteService } from 'src/turbo/assistente.service';
import { Auditoria } from './modelo/auditoria.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auditoria], 'principal'),
    TypeOrmModule.forFeature([Auditoria], 'replica'),
  ],
  exports: [
    AuditoriaService,
  ],
  providers: [
    AssistenteService,
    AuditoriaService,
  ],
  controllers: [
    AuditoriaController,
  ],
})
export class AuditoriaModule {}
