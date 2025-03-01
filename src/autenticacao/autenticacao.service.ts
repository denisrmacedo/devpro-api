import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AutorizacaoCompleta, Identificacao } from './identificacao';
import { Credencial } from './credencial';
import { AssistenteService } from 'src/turbo/assistente.service';
import { UsuarioService } from 'src/base/alfa/usuario/usuario.service';
import { EmpresaService } from 'src/base/alfa/empresa/empresa.service';
import { AutorizacaoService } from 'src/base/seguranca/autorizacao/autorizacao.service';
import { Empresa } from 'src/base/alfa/empresa/modelo/empresa.entity';

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly assistenteService: AssistenteService,
    private readonly usuarioService: UsuarioService,
    private readonly empresaService: EmpresaService,
    private readonly autorizacaoService: AutorizacaoService,
  ) { }

  async conecta(credencial: Credencial): Promise<Identificacao> {
    if (!(credencial.chave && credencial.senha)) {
      throw new UnauthorizedException('credenciais inválidas');
    }
    return this.autorizacao(credencial, null);
  }

  async conectaEmpresa(credencial: Credencial, empresa: Empresa): Promise<Identificacao> {
    if (!(credencial.chave && credencial.senha)) {
      throw new UnauthorizedException('credenciais inválidas');
    }
    if (!(empresa.id)) {
      throw new UnauthorizedException('empresa inválida');
    }
    return this.autorizacao(credencial, empresa);
  }

  async autorizacao(credencial: Credencial, empresa: Empresa): Promise<Identificacao> {
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
    if (!empresa) {
      if (usuario.empresa) {
        empresa = await this.empresaService.capta(null, usuario.empresa.id);
      } else {
        const empresas = await this.empresaService.lista(null, { atuante: 1 });
        if (!empresas?.length) {
          throw new UnauthorizedException('usuário sem empresas vinculadas');
        }
        empresa = await this.empresaService.capta(null, empresas[0].id);
      }
    } else {
      empresa = await this.empresaService.capta(null, empresa.id);
    }
    if (process.env.DEPURACAO === '1') {
      empresa.servidor.gravacao = 'http://localhost:3000';
      empresa.servidor.leitura = 'http://localhost:3000';
    }
    const autorizacao = await this.autorizacaoService.salva(null, {
      situacao: 1,
      usuario: usuario,
      empresa: empresa,
      ip: credencial.ip,
      aplicativo: credencial.aplicativo || 1,
      navegador: credencial.navegador || 'chrome',
      horario: credencial.horario || 'UTC+0',
      inicio: new Date(),
      conclusao: new Date(Date.now() + ((24 * 60 * 60 * 1000) - 1000)),
    });
    await this.usuarioService.editaEmpresa(null, usuario, empresa);
    const identificacao: Identificacao = {
      id: autorizacao.id,
      chave: usuarioCredencial.chave,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        imagem: usuario.imagem,
      },
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        imagem: empresa.imagem,
      },
      horario: autorizacao.horario,
      inicio: autorizacao.inicio,
      conclusao: autorizacao.conclusao,
    };
    const token = await this.jwtService.signAsync(identificacao);
    const autorizacaoCompleta: AutorizacaoCompleta = {
      ...identificacao,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        imagem: empresa.imagem,
      },
      servidor: {
        id: empresa.servidor.id,
        nome: empresa.servidor.nome,
        gravacao: empresa.servidor.gravacao,
        leitura: empresa.servidor.leitura,
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
    consulta.push(`  MIN(acessar) acessar,`);
    consulta.push(`  MIN(adicionar) adicionar,`);
    consulta.push(`  MIN(editar) editar,`);
    consulta.push(`  MIN(remover) remover,`);
    consulta.push(`  MIN(compartilhar) compartilhar,`);
    consulta.push(`  MIN(aprovar) aprovar,`);
    consulta.push(`  MIN(reverter) reverter`);
    consulta.push(`FROM`);
    consulta.push(`  seguranca."perfilRota"`);
    consulta.push(`WHERE`);
    consulta.push(`  ("perfilId" IN (SELECT UNNEST("perfilIds") FROM alfa."usuarioEmpresa" WHERE "usuarioId" = '${id}') AND (remocao IS NULL))`);
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