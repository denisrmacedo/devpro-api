import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';

import { Public } from './public.decorator';
import { Identificacao } from './identificacao';
import { AutenticacaoService } from './autenticacao.service';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post()
  conecta(@Body() credencial: { email: string, senha: string }): Promise<{ identificacao: Identificacao, token: string }> {
    return this.autenticacaoService.conecta(credencial.email, credencial.senha);
  }

  @Get()
  identificacao(@Request() request: any) {
    return request.identificacao;
  }
}
