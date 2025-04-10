import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Estabelecimento } from './modelo/estabelecimento.entity';
import { EstabelecimentoService } from './estabelecimento.service';
import { EstabelecimentoController } from './estabelecimento.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Estabelecimento], 'gravacao'),
    TypeOrmModule.forFeature([Estabelecimento], 'leitura'),
    TurboModule,
  ],
  exports: [
    EstabelecimentoService,
  ],
  providers: [
    EstabelecimentoService,
  ],
  controllers: [
    EstabelecimentoController,
  ],
})
export class EstabelecimentoModule { }
