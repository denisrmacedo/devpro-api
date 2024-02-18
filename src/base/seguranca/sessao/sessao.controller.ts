import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { SessaoService } from './sessao.service';
import { Sessao } from './modelo/sessao.entity';

@Controller('base/alfa/sessao')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Sessao>> {
    return this.sessaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Sessao>> {
    return this.sessaoService.sincroniza(identificacao, criterios);
  }

  @Get('/procura')
  procura(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Sessao[]> {
    return this.sessaoService.procura(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Sessao> {
    return this.sessaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() sessao: Sessao): Promise<Sessao> {
    return this.sessaoService.salva(identificacao, sessao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Sessao> {
    return this.sessaoService.remove(identificacao, id);
  }
}