import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { GrupoTributario } from './modelo/grupo-tributario.entity';
import { GrupoTributarioService } from './grupo-tributario.service';
import { GrupoTributarioController } from './grupo-tributario.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([GrupoTributario], 'gravacao'),
    TypeOrmModule.forFeature([GrupoTributario], 'leitura'),
    TurboModule,
  ],
  exports: [
    GrupoTributarioService,
  ],
  providers: [
    GrupoTributarioService,
  ],
  controllers: [
    GrupoTributarioController,
  ],
})
export class GrupoTributarioModule { }
