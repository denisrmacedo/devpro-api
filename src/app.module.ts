import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuarioModule } from './base/administrativo/usuario/usuario.module';
import { EmpresaModule } from './base/administrativo/empresa/empresa.module';
import { FilialModule } from './base/administrativo/filial/filial.module';
import { OrganizacaoModule } from './base/administrativo/organizacao/organizacao.module';
import { PaisModule } from './base/geografia/pais/pais.module';
import { TerritorioModule } from './base/geografia/territorio/territorio.module';
import { DdiModule } from './base/global/ddi/ddi.module';
import { RegiaoModule } from './base/nacional/regiao/regiao.module';
import { UfModule } from './base/nacional/uf/uf.module';
import { MesorregiaoModule } from './base/nacional/mesorregiao/mesorregiao.module';
import { MicrorregiaoModule } from './base/nacional/microrregiao/microrregiao.module';
import { RegiaoIntermediariaModule } from './base/nacional/regiao-intermediaria/regiao-intermediaria.module';
import { RegiaoImediataModule } from './base/nacional/regiao-imediata/regiao-imediata.module';
import { MunicipioModule } from './base/nacional/municipio/municipio.module';
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
    FilialModule,
    OrganizacaoModule,
    PaisModule,
    TerritorioModule,
    DdiModule,
    RegiaoModule,
    UfModule,
    MesorregiaoModule,
    MicrorregiaoModule,
    RegiaoIntermediariaModule,
    RegiaoImediataModule,
    MunicipioModule,
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
