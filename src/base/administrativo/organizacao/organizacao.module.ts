import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Organizacao } from './modelo/organizacao.entity';
import { OrganizacaoService } from './organizacao.service';
import { OrganizacaoController } from './organizacao.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Organizacao], 'gravacao'),
    TypeOrmModule.forFeature([Organizacao], 'leitura'),
    TurboModule,
  ],
  exports: [
    OrganizacaoService,
  ],
  providers: [
    OrganizacaoService,
  ],
  controllers: [
    OrganizacaoController,
  ],
})
export class OrganizacaoModule { }
