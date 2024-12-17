import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Servidor } from './modelo/servidor.entity';
import { ServidorService } from './servidor.service';

@Controller('base/sistema/servidor')
export class ServidorController {
  constructor(private readonly servidorService: ServidorService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Servidor>> {
    return this.servidorService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Servidor>> {
    return this.servidorService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Servidor[]> {
    return this.servidorService.lista(identificacao, criterios);
  }

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Servidor[]> {
    return this.servidorService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Servidor> {
    return this.servidorService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() servidor: Servidor): Promise<Servidor> {
    return this.servidorService.salva(identificacao, servidor);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Servidor> {
    return this.servidorService.remove(identificacao, id);
  }
}