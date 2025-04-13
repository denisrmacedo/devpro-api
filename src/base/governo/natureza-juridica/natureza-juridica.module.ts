import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { NaturezaJuridica } from './modelo/natureza-juridica.entity';
import { NaturezaJuridicaService } from './natureza-juridica.service';
import { NaturezaJuridicaController } from './natureza-juridica.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([NaturezaJuridica], 'gravacao'),
    TypeOrmModule.forFeature([NaturezaJuridica], 'leitura'),
    TurboModule,
  ],
  exports: [
    NaturezaJuridicaService,
  ],
  providers: [
    NaturezaJuridicaService,
  ],
  controllers: [
    NaturezaJuridicaController,
  ],
})
export class NaturezaJuridicaModule { }
