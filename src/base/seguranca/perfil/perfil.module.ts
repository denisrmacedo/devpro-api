import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Perfil } from './modelo/perfil.entity';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Perfil], 'gravacao'),
    TypeOrmModule.forFeature([Perfil], 'leitura'),
    TurboModule,
  ],
  exports: [
    PerfilService,
  ],
  providers: [
    PerfilService,
  ],
  controllers: [
    PerfilController,
  ],
})
export class PerfilModule { }
