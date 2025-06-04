import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Microrregiao } from './modelo/microrregiao.entity';
import { MicrorregiaoService } from './microrregiao.service';
import { MicrorregiaoController } from './microrregiao.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Microrregiao], 'gravacao'),
    TypeOrmModule.forFeature([Microrregiao], 'leitura'),
    TurboModule,
  ],
  exports: [
    MicrorregiaoService,
  ],
  providers: [
    MicrorregiaoService,
  ],
  controllers: [
    MicrorregiaoController,
  ],
})
export class MicrorregiaoModule { }
