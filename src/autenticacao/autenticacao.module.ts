import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoController } from './autenticacao.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'segredo',
      signOptions: { expiresIn: '24h' },
    }),
    UsuarioModule,
  ],
  providers: [AutenticacaoService],
  controllers: [AutenticacaoController]
})
export class AutenticacaoModule {}
