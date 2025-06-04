import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Mesorregiao } from './modelo/mesorregiao.entity';
import { MesorregiaoService } from './mesorregiao.service';
import { MesorregiaoController } from './mesorregiao.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Mesorregiao], 'gravacao'),
    TypeOrmModule.forFeature([Mesorregiao], 'leitura'),
    TurboModule,
  ],
  exports: [
    MesorregiaoService,
  ],
  providers: [
    MesorregiaoService,
  ],
  controllers: [
    MesorregiaoController,
  ],
})
export class MesorregiaoModule { }
