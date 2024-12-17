import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Autorizacao } from './modelo/autorizacao.entity';
import { AutorizacaoService } from './autorizacao.service';
import { AutorizacaoController } from './autorizacao.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Autorizacao], 'gravacao'),
    TypeOrmModule.forFeature([Autorizacao], 'leitura'),
    TurboModule,
  ],
  exports: [
    AutorizacaoService,
  ],
  providers: [
    AutorizacaoService,
  ],
  controllers: [
    AutorizacaoController,
  ],
})
export class AutorizacaoModule {}
