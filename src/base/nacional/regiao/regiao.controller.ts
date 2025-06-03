import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Regiao } from './modelo/regiao.entity';
import { RegiaoService } from './regiao.service';

@Controller('base/nacional/regiao')
export class RegiaoController {
  constructor(private readonly regiaoService: RegiaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Regiao>> {
    return this.regiaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Regiao>> {
    return this.regiaoService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Regiao[]> {
    return this.regiaoService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Regiao[]> {
    return this.regiaoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Regiao> {
    return this.regiaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() regiao: Regiao): Promise<Regiao> {
    return this.regiaoService.salva(identificacao, regiao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Regiao> {
    return this.regiaoService.remove(identificacao, id);
  }
}