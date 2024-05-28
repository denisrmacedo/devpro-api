import { Controller, Param, Query, Body, Get, Post, Delete } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from './modelo/usuario.entity';

@Controller('base/alfa/usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('/indice')
  indice(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Usuario>> {
    return this.usuarioService.indice(identificacao, criterios);
  }
  @Get('/sincroniza')
  sincroniza(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Pagina<Usuario>> {
    return this.usuarioService.sincroniza(identificacao, criterios);
  }

  @Get('/lista')
  lista(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Usuario[]> {
    return this.usuarioService.lista(identificacao, criterios);
  }

  @Get('/procura')
  procura(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Usuario[]> {
    return this.usuarioService.procura(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Usuario> {
    return this.usuarioService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() usuario: Usuario): Promise<Usuario> {
    return this.usuarioService.salva(identificacao, usuario);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Usuario> {
    return this.usuarioService.remove(identificacao, id);
  }
}