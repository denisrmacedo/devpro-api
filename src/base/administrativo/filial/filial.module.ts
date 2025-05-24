import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Filial } from './modelo/filial.entity';
import { FilialService } from './filial.service';
import { FilialController } from './filial.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Filial], 'gravacao'),
    TypeOrmModule.forFeature([Filial], 'leitura'),
    TurboModule,
  ],
  exports: [
    FilialService,
  ],
  providers: [
    FilialService,
  ],
  controllers: [
    FilialController,
  ],
})
export class FilialModule { }
