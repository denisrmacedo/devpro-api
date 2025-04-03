import { Controller, Param, Query, Body, Get, Post, Delete, Patch } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { Pagina } from 'src/turbo/assistente.service';
import { Usuario } from './modelo/usuario.entity';
import { UsuarioService } from './usuario.service';

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

  @Get('/busca')
  busca(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<Usuario[]> {
    return this.usuarioService.busca(identificacao, criterios);
  }

  @Get(':id')
  obtem(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Usuario> {
    return this.usuarioService.capta(identificacao, id);
  }

  @Post()
  salva(@Auth() identificacao: Identificacao, @Body() usuario: Usuario): Promise<Usuario> {
    return this.usuarioService.salva(identificacao, usuario);
  }

  @Patch(':id/editasenha')
  editaSenha(@Auth() identificacao: Identificacao, @Param('id') id: string, @Body() atributos: any): Promise<Usuario> {
    return this.usuarioService.editaSenha(identificacao, id, atributos);
  }

  @Patch(':id/editaempresa')
  editaEmpresa(@Auth() identificacao: Identificacao, @Param('id') id: string, @Body() atributos: any): Promise<Usuario> {
    return this.usuarioService.editaEmpresa(identificacao, id, atributos);
  }

  @Delete(':id')
  remove(@Auth() identificacao: Identificacao, @Param('id') id: string): Promise<Usuario> {
    return this.usuarioService.remove(identificacao, id);
  }
}