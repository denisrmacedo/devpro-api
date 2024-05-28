<<<<<<< HEAD
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() credencial: Record<string, string>): Promise<{ token: string }> {
    return this.autenticacaoService.login(credencial.email, credencial.senha);
  }
}
=======
import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Request } from '@nestjs/common';

import { Public } from './public.decorator';
import { Identificacao } from './identificacao';
import { AutenticacaoService } from './autenticacao.service';
import { Credencial } from './credencial';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post()
  conecta(@Body() credencial: Credencial, @Ip() ip: string): Promise<Identificacao> {
    credencial.ip = ip;
    return this.autenticacaoService.conecta(credencial);
  }

  @Get()
  identificacao(@Request() request: any): Promise<Identificacao> {
    // melhorar esse tratamento
    return {
      ...request.identificacao,
      token: request.token,
    };
  }
}
>>>>>>> ed13384471729ea0469223724bd2d02856d63223
