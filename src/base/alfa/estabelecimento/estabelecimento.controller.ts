import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Estabelecimento } from './modelo/estabelecimento.entity';
import { EstabelecimentoService } from './estabelecimento.service';

@Controller('base/alfa/estabelecimento')
export class EstabelecimentoController {
  constructor(private readonly estabelecimentoService: EstabelecimentoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Estabelecimento>> {
    return this.estabelecimentoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Estabelecimento>> {
    return this.estabelecimentoService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Estabelecimento[]> {
    return this.estabelecimentoService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Estabelecimento[]> {
    return this.estabelecimentoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Estabelecimento> {
    return this.estabelecimentoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() estabelecimento: Estabelecimento): Promise<Estabelecimento> {
    return this.estabelecimentoService.salva(identificacao, estabelecimento);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Estabelecimento> {
    return this.estabelecimentoService.remove(identificacao, id);
  }
}