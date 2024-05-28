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
