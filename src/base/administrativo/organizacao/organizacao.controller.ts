import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Organizacao } from './modelo/organizacao.entity';
import { OrganizacaoService } from './organizacao.service';

@Controller('base/administrativo/organizacao')
export class OrganizacaoController {
  constructor(private readonly organizacaoService: OrganizacaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Organizacao>> {
    return this.organizacaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Organizacao>> {
    return this.organizacaoService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Organizacao[]> {
    return this.organizacaoService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Organizacao[]> {
    return this.organizacaoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Organizacao> {
    return this.organizacaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() organizacao): Promise<Organizacao> {
    return this.organizacaoService.salva(identificacao, organizacao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Organizacao> {
    return this.organizacaoService.remove(identificacao, id);
  }
}