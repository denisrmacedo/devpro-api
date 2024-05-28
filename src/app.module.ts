import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base/base.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { UsuarioModule } from './base/alfa/usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    BaseModule,
    AutenticacaoModule,
    UsuarioModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
