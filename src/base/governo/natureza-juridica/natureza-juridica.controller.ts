import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { NaturezaJuridica } from './modelo/natureza-juridica.entity';
import { NaturezaJuridicaService } from './natureza-juridica.service';

@Controller('base/governo/natureza-juridica')
export class NaturezaJuridicaController {
  constructor(private readonly naturezaJuridicaService: NaturezaJuridicaService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<NaturezaJuridica>> {
    return this.naturezaJuridicaService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<NaturezaJuridica>> {
    return this.naturezaJuridicaService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<NaturezaJuridica[]> {
    return this.naturezaJuridicaService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<NaturezaJuridica[]> {
    return this.naturezaJuridicaService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<NaturezaJuridica> {
    return this.naturezaJuridicaService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() naturezaJuridica: NaturezaJuridica): Promise<NaturezaJuridica> {
    return this.naturezaJuridicaService.salva(identificacao, naturezaJuridica);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<NaturezaJuridica> {
    return this.naturezaJuridicaService.remove(identificacao, id);
  }
}