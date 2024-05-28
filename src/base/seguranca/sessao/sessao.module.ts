import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssistenteService } from 'src/turbo/assistente.service';
import { Sessao } from './modelo/sessao.entity';
import { SessaoService } from './sessao.service';
import { SessaoController } from './sessao.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sessao], 'principal'),
    TypeOrmModule.forFeature([Sessao], 'replica'),
  ],
  exports: [
    SessaoService,
  ],
  providers: [
    AssistenteService,
    SessaoService,
  ],
  controllers: [
    SessaoController,
  ],
})
export class SessaoModule {}
