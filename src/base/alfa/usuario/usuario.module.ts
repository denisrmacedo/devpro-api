import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssistenteService } from 'src/turbo/assistente.service';
import { Usuario } from './modelo/usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario], 'principal'),
    TypeOrmModule.forFeature([Usuario], 'replica'),
  ],
  exports: [
    UsuarioService,
  ],
  providers: [
    AssistenteService,
    UsuarioService,
  ],
  controllers: [
    UsuarioController,
  ],
})
export class UsuarioModule {}
