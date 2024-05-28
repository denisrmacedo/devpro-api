<<<<<<< HEAD
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) { }

  async login(email: string, senha: string): Promise<{ token: string }> {
    const usuario = await this.usuarioService.procura(email);
    if (!usuario)
      throw new UnauthorizedException('usuário inválido');
    if (usuario.senha !== senha)
      throw new UnauthorizedException('usuário inválido');
    const payload = { sub: usuario.id, email: usuario.email };
    return { token: await this.jwtService.signAsync(payload) };
  }
}
=======
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Identificacao } from './identificacao';
import { Credencial } from './credencial';
import { UsuarioService } from 'src/base/alfa/usuario/usuario.service';
import { SessaoService } from 'src/base/seguranca/sessao/sessao.service';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    private readonly sessaoService: SessaoService,
  ) {}

  async conecta(credencial: Credencial): Promise<Identificacao> {
    const usuarios = await this.usuarioService.procura(null, { chave: credencial.email });
    if (!usuarios?.length)
      throw new UnauthorizedException('usuário inválido');
    if (usuarios.length > 1)
      throw new UnauthorizedException('chave de identificacao duplicada');
    const [usuario] = usuarios;
    if (!usuario.usuarioCredenciais)
      throw new UnauthorizedException('usuário inválido');
    const usuarioCredencial = usuario.usuarioCredenciais?.find(
      usuarioCredencial => usuarioCredencial.chave === credencial.email,
    );
    if (!usuarioCredencial)
      throw new UnauthorizedException('usuário inválido');
    if (!await bcrypt.compare(credencial.senha, usuarioCredencial.senha))
      throw new UnauthorizedException('usuário inválido');
    const sessao = await this.sessaoService.salva(null, {
      situacao: 1,
      usuario: usuario,
      ip: credencial.ip,
      aplicativo: credencial.aplicativo || 1,
      navegador: credencial.navegador || 'chrome',
      fuso: credencial.fuso || 'UTC+0',
      inicio: new Date(),
      conclusao: null,
    });
    const identificacao: Identificacao = {
      sub: usuario.id,
      chave: usuarioCredencial.chave,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: credencial.email,
      },
      sessao: {
        id: sessao.id,
        inicio: sessao.inicio,
      },
      fuso: sessao.fuso,
      token: null,
    };
    delete identificacao.token;
    identificacao.token = await this.jwtService.signAsync(identificacao);
    return identificacao;
  }
}
>>>>>>> ed13384471729ea0469223724bd2d02856d63223
