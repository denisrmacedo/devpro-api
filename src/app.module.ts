import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuarioModule } from './base/administrativo/usuario/usuario.module';
import { EmpresaModule } from './base/administrativo/empresa/empresa.module';
import { EstabelecimentoModule } from './base/administrativo/estabelecimento/estabelecimento.module';
import { CnaeModule } from './base/governo/cnae/cnae.module';
import { NaturezaJuridicaModule } from './base/governo/natureza-juridica/natureza-juridica.module';
import { GrupoTributarioModule } from './base/governo/grupo-tributario/grupo-tributario.module';
import { PerfilModule } from './base/seguranca/perfil/perfil.module';
import { ServidorModule } from './base/sistema/servidor/servidor.module';
import { DashboardModule } from './avaliacao/analise/dashboard/dashboard.module';
import { ArquivoModule } from './integracao/arquivo/arquivo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    BaseModule,
    AutenticacaoModule,
    DashboardModule,
    EmpresaModule,
    EstabelecimentoModule,
    CnaeModule,
    NaturezaJuridicaModule,
    GrupoTributarioModule,
    UsuarioModule,
    PerfilModule,
    ServidorModule,
    ArquivoModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule { }
