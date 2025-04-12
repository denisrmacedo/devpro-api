import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { AutorizacaoService } from './autorizacao.service';
import { Autorizacao } from './modelo/autorizacao.entity';

@Controller('base/administrativo/autorizacao')
export class AutorizacaoController {
  constructor(private readonly autorizacaoService: AutorizacaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Autorizacao>> {
    return this.autorizacaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Autorizacao>> {
    return this.autorizacaoService.sincroniza(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Autorizacao[]> {
    return this.autorizacaoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Autorizacao> {
    return this.autorizacaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() autorizacao: Autorizacao): Promise<Autorizacao> {
    return this.autorizacaoService.salva(identificacao, autorizacao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Autorizacao> {
    return this.autorizacaoService.remove(identificacao, id);
  }
}