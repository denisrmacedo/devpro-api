import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { RegiaoIntermediaria } from './modelo/regiao-intermediaria.entity';
import { RegiaoIntermediariaService } from './regiao-intermediaria.service';

@Controller('base/nacional/regiao-intermediaria')
export class RegiaoIntermediariaController {
  constructor(private readonly regiaoIntermediariaService: RegiaoIntermediariaService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<RegiaoIntermediaria>> {
    return this.regiaoIntermediariaService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<RegiaoIntermediaria>> {
    return this.regiaoIntermediariaService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<RegiaoIntermediaria[]> {
    return this.regiaoIntermediariaService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<RegiaoIntermediaria[]> {
    return this.regiaoIntermediariaService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<RegiaoIntermediaria> {
    return this.regiaoIntermediariaService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() regiaoIntermediaria: RegiaoIntermediaria): Promise<RegiaoIntermediaria> {
    return this.regiaoIntermediariaService.salva(identificacao, regiaoIntermediaria);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<RegiaoIntermediaria> {
    return this.regiaoIntermediariaService.remove(identificacao, id);
  }
}