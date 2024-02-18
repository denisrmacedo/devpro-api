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
  conecta(@Body() credencial: Credencial, @Ip() ip: string): Promise<{ identificacao: Identificacao, token: string }> {
    credencial.ip = ip;
    return this.autenticacaoService.conecta(credencial);
  }

  @Get()
  identificacao(@Request() request: any) {
    return request.identificacao;
  }
}
