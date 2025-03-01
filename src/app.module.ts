import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuarioModule } from './base/alfa/usuario/usuario.module';
import { EmpresaModule } from './base/alfa/empresa/empresa.module';
import { PerfilModule } from './base/seguranca/perfil/perfil.module';
import { ServidorModule } from './base/sistema/servidor/servidor.module';
import { DashboardModule } from './avaliacao/analise/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    BaseModule,
    AutenticacaoModule,
    DashboardModule,
    EmpresaModule,
    UsuarioModule,
    PerfilModule,
    ServidorModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule { }
