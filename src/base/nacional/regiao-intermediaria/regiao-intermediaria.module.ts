import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { RegiaoIntermediaria } from './modelo/regiao-intermediaria.entity';
import { RegiaoIntermediariaService } from './regiao-intermediaria.service';
import { RegiaoIntermediariaController } from './regiao-intermediaria.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([RegiaoIntermediaria], 'gravacao'),
    TypeOrmModule.forFeature([RegiaoIntermediaria], 'leitura'),
    TurboModule,
  ],
  exports: [
    RegiaoIntermediariaService,
  ],
  providers: [
    RegiaoIntermediariaService,
  ],
  controllers: [
    RegiaoIntermediariaController,
  ],
})
export class RegiaoIntermediariaModule { }
