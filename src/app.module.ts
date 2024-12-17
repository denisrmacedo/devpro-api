import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuarioModule } from './base/alfa/usuario/usuario.module';
import { EmpresaModule } from './base/alfa/empresa/empresa.module';
import { ServidorModule } from './base/sistema/servidor/servidor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    BaseModule,
    AutenticacaoModule,
    EmpresaModule,
    UsuarioModule,
    ServidorModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
