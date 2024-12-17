import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './modelo/auditoria.entity';

@Controller('base/alfa/auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Auditoria>> {
    return this.auditoriaService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Auditoria>> {
    return this.auditoriaService.sincroniza(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Auditoria[]> {
    return this.auditoriaService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Auditoria> {
    return this.auditoriaService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() auditoria: Auditoria): Promise<Auditoria> {
    return this.auditoriaService.salva(identificacao, auditoria);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Auditoria> {
    return this.auditoriaService.remove(identificacao, id);
  }
}