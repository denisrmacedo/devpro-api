import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Empresa } from './modelo/empresa.entity';
import { EmpresaService } from './empresa.service';

@Controller('base/alfa/empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Empresa>> {
    return this.empresaService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Empresa>> {
    return this.empresaService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Empresa[]> {
    return this.empresaService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Empresa[]> {
    return this.empresaService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Empresa> {
    return this.empresaService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() empresa: Empresa): Promise<Empresa> {
    return this.empresaService.salva(identificacao, empresa);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Empresa> {
    return this.empresaService.remove(identificacao, id);
  }
}