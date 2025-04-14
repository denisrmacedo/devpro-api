import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { GrupoTributario } from './modelo/grupo-tributario.entity';
import { GrupoTributarioService } from './grupo-tributario.service';

@Controller('base/governo/grupo-tributario')
export class GrupoTributarioController {
  constructor(private readonly GrupoTributarioService: GrupoTributarioService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<GrupoTributario>> {
    return this.GrupoTributarioService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<GrupoTributario>> {
    return this.GrupoTributarioService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<GrupoTributario[]> {
    return this.GrupoTributarioService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<GrupoTributario[]> {
    return this.GrupoTributarioService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<GrupoTributario> {
    return this.GrupoTributarioService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() GrupoTributario: GrupoTributario): Promise<GrupoTributario> {
    return this.GrupoTributarioService.salva(identificacao, GrupoTributario);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<GrupoTributario> {
    return this.GrupoTributarioService.remove(identificacao, id);
  }
}