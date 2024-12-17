import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Empresa } from './modelo/empresa.entity';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa], 'gravacao'),
    TypeOrmModule.forFeature([Empresa], 'leitura'),
    TurboModule,
  ],
  exports: [
    EmpresaService,
  ],
  providers: [
    EmpresaService,
  ],
  controllers: [
    EmpresaController,
  ],
})
export class EmpresaModule { }
