import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Municipio } from './modelo/municipio.entity';
import { MunicipioService } from './municipio.service';
import { MunicipioController } from './municipio.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Municipio], 'gravacao'),
    TypeOrmModule.forFeature([Municipio], 'leitura'),
    TurboModule,
  ],
  exports: [
    MunicipioService,
  ],
  providers: [
    MunicipioService,
  ],
  controllers: [
    MunicipioController,
  ],
})
export class MunicipioModule { }
