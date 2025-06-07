import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Territorio } from './modelo/territorio.entity';
import { TerritorioService } from './territorio.service';

@Controller('base/global/territorio')
export class TerritorioController {
  constructor(private readonly territorioService: TerritorioService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Territorio>> {
    return this.territorioService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Territorio>> {
    return this.territorioService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Territorio[]> {
    return this.territorioService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Territorio[]> {
    return this.territorioService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Territorio> {
    return this.territorioService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() territorio: Territorio): Promise<Territorio> {
    return this.territorioService.salva(identificacao, territorio);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Territorio> {
    return this.territorioService.remove(identificacao, id);
  }
}