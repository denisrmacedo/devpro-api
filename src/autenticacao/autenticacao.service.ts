import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AutorizacaoCompleta, Identificacao } from './identificacao';
import { Credencial } from './credencial';
import { AssistenteService } from 'src/turbo/assistente.service';
import { UsuarioService } from 'src/base/administrativo/usuario/usuario.service';
import { OrganizacaoService } from 'src/base/administrativo/organizacao/organizacao.service';
import { AutorizacaoService } from 'src/base/seguranca/autorizacao/autorizacao.service';
import { Organizacao } from 'src/base/administrativo/organizacao/modelo/organizacao.entity';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly assistenteService: AssistenteService,
    private readonly usuarioService: UsuarioService,
    private readonly organizacaoService: OrganizacaoService,
    private readonly autorizacaoService: AutorizacaoService,
  ) { }

  async conecta(credencial: Credencial): Promise<Identificacao> {
    if (!(credencial.chave && credencial.senha)) {
      throw new UnauthorizedException('credenciais inválidas');
    }
    return this.autorizacao(credencial, null);
  }

  async conectaOrganizacao(credencial: Credencial, organizacao: Organizacao): Promise<Identificacao> {
    if (!(credencial.chave && credencial.senha)) {
      throw new UnauthorizedException('credenciais inválidas');
    }
    if (!organizacao.id) {
      throw new UnauthorizedException('organizacao inválida');
    }
    return this.autorizacao(credencial, organizacao);
  }

  async autorizacao(credencial: Credencial, organizacao: Organizacao): Promise<Identificacao> {
    const usuarios = await this.usuarioService.busca(null, { chave: credencial.chave });
    if (!usuarios?.length) {
      throw new UnauthorizedException('usuário inválido');
    }
    if (usuarios.length > 1) {
      throw new UnauthorizedException('chave de identificacao duplicada');
    }
    const [usuario] = usuarios;
    if (!usuario.atuante) {
      throw new UnauthorizedException('usuário inativo');
    }
    if (!usuario.usuarioCredenciais) {
      throw new UnauthorizedException('usuário inválido');
    }
    const usuarioCredencial = usuario.usuarioCredenciais?.find(
      usuarioCredencial => usuarioCredencial.chave === credencial.chave,
    );
    if (!usuarioCredencial) {
      throw new UnauthorizedException('usuário inválido');
    }
    if (!await bcrypt.compare(credencial.senha, usuarioCredencial.senha)) {
      throw new UnauthorizedException('credenciais inválidas');
    }
    if (!organizacao) {
      if (usuario.organizacao) {
        organizacao = await this.organizacaoService.capta(null, usuario.organizacao.id);
      } else {
        const organizacoes = await this.organizacaoService.lista(null, { atuante: 1 });
        if (!organizacoes?.length) {
          throw new UnauthorizedException('usuário sem organizações vinculadas');
        }
        organizacao = await this.organizacaoService.capta(null, organizacoes[0].id);
      }
    } else {
      organizacao = await this.organizacaoService.capta(null, organizacao.id);
    }
    if (process.env.DEPURACAO === '1') {
      organizacao.servidor.gravacao = 'http://localhost:3000';
      organizacao.servidor.leitura = 'http://localhost:3000';
    }
    const autorizacao = await this.autorizacaoService.salva(null, {
      situacao: 1,
      usuario: usuario,
      organizacao: organizacao,
      ip: credencial.ip,
      aplicativo: credencial.aplicativo || 1,
      navegador: credencial.navegador || 'chrome',
      nacao: credencial.nacao || 'BR',
      horario: credencial.horario || 'UTC+0',
      inicio: new Date(),
      conclusao: new Date(Date.now() + ((24 * 60 * 60 * 1000) - 1000)),
    });
    await this.usuarioService.vinculaOrganizacao(null, usuario, organizacao);
    const identificacao: Identificacao = {
      id: autorizacao.id,
      chave: usuarioCredencial.chave,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        imagem: usuario.imagem,
      },
      organizacao: {
        id: organizacao.id,
        nome: organizacao.nome,
        imagem: organizacao.imagem,
      },
      nacao: autorizacao.nacao,
      horario: autorizacao.horario,
      inicio: autorizacao.inicio,
      conclusao: autorizacao.conclusao,
    };
    const token = await this.jwtService.signAsync(identificacao);
    const autorizacaoCompleta: AutorizacaoCompleta = {
      ...identificacao,
      organizacao: {
        id: organizacao.id,
        nome: organizacao.nome,
        imagem: organizacao.imagem,
      },
      servidor: {
        id: organizacao.servidor.id,
        nome: organizacao.servidor.nome,
        gravacao: organizacao.servidor.gravacao,
        leitura: organizacao.servidor.leitura,
      },
      token,
    }
    return autorizacaoCompleta;
  }

  async permissoes(identificacao: Identificacao, id: string) {
    id ??= identificacao.usuario.id;
    const usuario = await this.usuarioService.capta(identificacao, id);
    const consulta: string[] = [];
    consulta.push(`SELECT`);
    consulta.push(`  rota,`);
    consulta.push(`  MIN(acessa) acessa,`);
    consulta.push(`  MIN(adiciona) adicionar,`);
    consulta.push(`  MIN(edita) edita,`);
    consulta.push(`  MIN(remove) remove,`);
    consulta.push(`  MIN(compartilha) compartilha,`);
    consulta.push(`  MIN(aprova) aprova,`);
    consulta.push(`  MIN(reverte) reverte`);
    consulta.push(`FROM`);
    consulta.push(`  seguranca."perfilRota"`);
    consulta.push(`WHERE`);
    consulta.push(`  ("perfilId" IN (SELECT UNNEST("perfilIds") FROM administrativo."usuarioOrganizacao" WHERE ("usuarioId" = '${id}') AND (remocao IS NULL)) AND (remocao IS NULL))`);
    consulta.push(`  AND (remocao IS NULL)`);
    consulta.push(`GROUP BY`);
    consulta.push(`  rota`);
    consulta.push(`ORDER BY`);
    consulta.push(`  rota; `);
    const rotas = await this.assistenteService.leitura.query(consulta.join('\n'));
    return {
      id: usuario.id,
      nome: usuario.nome,
      administrador: usuario.administrador,
      super: usuario.super,
      rotas,
    };
  }
}