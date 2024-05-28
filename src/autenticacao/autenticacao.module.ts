import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AutenticacaoGuard } from './autenticacao.guard';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoController } from './autenticacao.controller';
import { UsuarioModule } from 'src/base/alfa/usuario/usuario.module';
import { SessaoModule } from 'src/base/seguranca/sessao/sessao.module';

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
    UsuarioModule,
    SessaoModule,
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
