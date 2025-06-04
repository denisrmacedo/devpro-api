import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Mesorregiao } from './modelo/mesorregiao.entity';
import { MesorregiaoService } from './mesorregiao.service';

@Controller('base/nacional/mesorregiao')
export class MesorregiaoController {
  constructor(private readonly mesorregiaoService: MesorregiaoService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Mesorregiao>> {
    return this.mesorregiaoService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Mesorregiao>> {
    return this.mesorregiaoService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Mesorregiao[]> {
    return this.mesorregiaoService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Mesorregiao[]> {
    return this.mesorregiaoService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Mesorregiao> {
    return this.mesorregiaoService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() mesorregiao: Mesorregiao): Promise<Mesorregiao> {
    return this.mesorregiaoService.salva(identificacao, mesorregiao);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Mesorregiao> {
    return this.mesorregiaoService.remove(identificacao, id);
  }
}