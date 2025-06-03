import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Regiao } from './modelo/regiao.entity';
import { RegiaoService } from './regiao.service';
import { RegiaoController } from './regiao.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Regiao], 'gravacao'),
    TypeOrmModule.forFeature([Regiao], 'leitura'),
    TurboModule,
  ],
  exports: [
    RegiaoService,
  ],
  providers: [
    RegiaoService,
  ],
  controllers: [
    RegiaoController,
  ],
})
export class RegiaoModule { }
