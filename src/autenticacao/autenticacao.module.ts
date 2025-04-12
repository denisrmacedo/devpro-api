import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AutenticacaoGuard } from './autenticacao.guard';
import { TurboModule } from 'src/turbo/turbo.module';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoController } from './autenticacao.controller';
import { UsuarioModule } from 'src/base/administrativo/usuario/usuario.module';
import { EmpresaModule } from 'src/base/administrativo/empresa/empresa.module';
import { AutorizacaoModule } from 'src/base/seguranca/autorizacao/autorizacao.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          global: true,
          secret: process.env.JWT_KEY,
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
    TurboModule,
    UsuarioModule,
    EmpresaModule,
    AutorizacaoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AutenticacaoGuard,
    },
    AutenticacaoService,
  ],
  controllers: [AutenticacaoController],
})
export class AutenticacaoModule {}
