import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Identificacao } from './identificacao';
import { UsuarioService } from 'src/base/alfa/usuario/usuario.service';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async conecta(email: string, senha: string): Promise<{ identificacao: Identificacao, token: string }> {
    const usuarios = await this.usuarioService.procura(null, { chave: email });
    if (!usuarios?.length)
      throw new UnauthorizedException('usuário inválido');
    if (usuarios.length > 1)
      throw new UnauthorizedException('chave de identificacao duplicada');
    const [usuario] = usuarios;
    if (!usuario.usuarioCredenciais)
      throw new UnauthorizedException('usuário inválido');
    const usuarioCredencial = usuario.usuarioCredenciais?.find(
      usuarioCredencial => usuarioCredencial.chave === email,
    );
    if (!usuarioCredencial)
      throw new UnauthorizedException('usuário inválido');
    if (!await bcrypt.compare(senha, usuarioCredencial.senha))
      throw new UnauthorizedException('usuário inválido');
    const identificacao: Identificacao = {
      sub: usuario.id,
      chave: usuarioCredencial.chave,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
      }
    };
    return { identificacao, token: await this.jwtService.signAsync(identificacao) };
  }
}
