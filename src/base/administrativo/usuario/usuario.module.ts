import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Usuario } from './modelo/usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario], 'gravacao'),
    TypeOrmModule.forFeature([Usuario], 'leitura'),
    TurboModule,
  ],
  exports: [
    UsuarioService,
  ],
  providers: [
    UsuarioService,
  ],
  controllers: [
    UsuarioController,
  ],
})
export class UsuarioModule {}
