import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Microrregiao } from './modelo/microrregiao.entity';
import { MicrorregiaoService } from './microrregiao.service';

@Controller('base/nacional/microrregiao')
export class MicrorregiaoController {
  constructor(private readonly microrregiaoService: MicrorregiaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Microrregiao>> {
    return this.microrregiaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Microrregiao>> {
    return this.microrregiaoService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Microrregiao[]> {
    return this.microrregiaoService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Microrregiao[]> {
    return this.microrregiaoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Microrregiao> {
    return this.microrregiaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() microrregiao: Microrregiao): Promise<Microrregiao> {
    return this.microrregiaoService.salva(identificacao, microrregiao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Microrregiao> {
    return this.microrregiaoService.remove(identificacao, id);
  }
}