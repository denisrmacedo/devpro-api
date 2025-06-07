import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Pais } from './modelo/pais.entity';
import { PaisService } from './pais.service';
import { PaisController } from './pais.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Pais], 'gravacao'),
    TypeOrmModule.forFeature([Pais], 'leitura'),
    TurboModule,
  ],
  exports: [
    PaisService,
  ],
  providers: [
    PaisService,
  ],
  controllers: [
    PaisController,
  ],
})
export class PaisModule { }
