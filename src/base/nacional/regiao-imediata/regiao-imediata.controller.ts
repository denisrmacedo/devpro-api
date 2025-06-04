import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { RegiaoImediata } from './modelo/regiao-imediata.entity';
import { RegiaoImediataService } from './regiao-imediata.service';

@Controller('base/nacional/regiao-imediata')
export class RegiaoImediataController {
  constructor(private readonly regiaoImediataService: RegiaoImediataService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<RegiaoImediata>> {
    return this.regiaoImediataService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<RegiaoImediata>> {
    return this.regiaoImediataService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<RegiaoImediata[]> {
    return this.regiaoImediataService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<RegiaoImediata[]> {
    return this.regiaoImediataService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<RegiaoImediata> {
    return this.regiaoImediataService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() regiaoImediata: RegiaoImediata): Promise<RegiaoImediata> {
    return this.regiaoImediataService.salva(identificacao, regiaoImediata);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<RegiaoImediata> {
    return this.regiaoImediataService.remove(identificacao, id);
  }
}