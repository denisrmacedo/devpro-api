import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Usuario, UsuarioSituacao } from './modelo/usuario.entity';
import { UsuarioCredencial } from './modelo/usuario-credencial.entity';
import { Empresa } from '../empresa/modelo/empresa.entity';
import { UsuarioEmpresa } from './modelo/usuario-empresa.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario, 'gravacao')
    private readonly gravacaoRepository: Repository<Usuario>,
    @InjectRepository(Usuario, 'leitura')
    private readonly leituraRepository: Repository<Usuario>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Usuario>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Usuario> = {
      relations: { usuarioCredenciais: true, usuarioEmpresas: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 }
    }
    options.where = [];
    if (criterios.situacao) {
      options.where.push({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      options.where.push({ codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.codigo }) });
    }
    if (criterios.nome) {
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    if (criterios.email) {
      options.where.push({
        id: Raw((alias) => `${alias} IN (${this.assistente.consultaIds('administrativo.usuarioCredencial', 'usuarioId', { chave: criterios.email })})`)
      });
    }
    const contagem = await this.leituraRepository.count(options);
    const pagina = await this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
    for (const usuario of pagina.linhas) {
      const usuarioCredencial = usuario.usuarioCredenciais.find(usuarioCredencial => usuarioCredencial.chave.includes('@'));
      if (usuarioCredencial) {
        usuario['email'] = usuarioCredencial.chave;
      }
      delete usuario.usuarioCredenciais;
      var perfis: string[] = [];
      for (const usuarioEmpresa of usuario.usuarioEmpresas) {
        if (!usuarioEmpresa.perfilIds?.length) {
          continue;
        }
        const consulta: string[] = [];
        consulta.push(`SELECT DISTINCT nome`);
        consulta.push(`FROM seguranca.perfil`);
        consulta.push(`WHERE`);
        consulta.push(`  (id IN (${usuarioEmpresa.perfilIds.map(perfilId => `'${perfilId.trim()}'`).join(', ')}))`);
        consulta.push(`  AND (remocao IS NULL)`);
        const usuarioPerfis: { nome: string }[] = await this.leituraRepository.query(consulta.join(' '));
        usuarioPerfis.map(usuarioPerfil => {
          if (!perfis.includes(usuarioPerfil.nome)) {
            perfis.push(usuarioPerfil.nome);
          }
        });
      }
      perfis = perfis.sort();
      if (usuario.super) {
        perfis = ['Sistema'];
      } else if (usuario.administrador) {
        if (!perfis.includes('Administradores')) {
          perfis = ['Administradores', ...perfis];
        }
      }
      if (!perfis.length) {
        perfis = ['Usuários'];
      }
      usuario['perfis'] = perfis;
      delete usuario.usuarioEmpresas;
    }
    return pagina;
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Usuario>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Usuario> = {
      where: { edicao: MoreThan(criterios.momento) },
      order: { edicao: 1 },
      skip: criterios.salto,
      take: criterios.linhas,
    };
    const contagem = await this.gravacaoRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async lista(identificacao: Identificacao, criterios: any): Promise<Usuario[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Usuario> = {
      select: { id: true, codigo: true, nome: true, imagem: true, situacao: true },
      relations: { usuarioCredenciais: true, usuarioEmpresas: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    options.where = [];
    if (criterios.situacao) {
      options.where.push({ situacao: criterios.situacao });
    }
    if (criterios.nome) {
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const usuarios = await this.leituraRepository.find(options);
    for (const usuario of usuarios) {
      const usuarioCredencial = usuario.usuarioCredenciais.find(usuarioCredencial => usuarioCredencial.chave.includes('@'));
      if (usuarioCredencial) {
        usuario['email'] = usuarioCredencial.chave;
      }
      delete usuario.usuarioCredenciais;
      var perfilIds: string[] = [];
      for (const usuarioEmpresa of usuario.usuarioEmpresas) {
        if (usuarioEmpresa.perfilIds?.length) {
          perfilIds.push(...usuarioEmpresa.perfilIds);
        }
      }
      var perfis: string[] = [];
      if (perfilIds.length) {
        const consulta: string[] = [];
        consulta.push(`SELECT DISTINCT nome`);
        consulta.push(`FROM seguranca.perfil`);
        consulta.push(`WHERE`);
        consulta.push(`  (id IN (${perfilIds.map(perfilId => `'${perfilId.trim()}'`).join(', ')}))`);
        consulta.push(`  AND (remocao IS NULL);`);
        const usuarioPerfis: { nome: string }[] = await this.leituraRepository.query(consulta.join(' ')) ?? [];
        perfis = usuarioPerfis.map(perfil => perfil.nome);
        perfis = perfis.sort();
      }
      if (usuario.super) {
        perfis = ['Sistema'];
      } else if (usuario.administrador) {
        if (!perfis.includes('Administradores')) {
          perfis = ['Administradores', ...perfis];
        }
      }
      usuario['perfis'] = perfis;
      delete usuario.usuarioEmpresas;
    }
    return usuarios;
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Usuario[]> {
    const options: FindManyOptions<Usuario> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.super === '1') {
      options.where.push({ super: true });
    }
    if (criterios.chave) {
      options.where.push({ usuarioCredenciais: { chave: criterios.chave } });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Usuario> {
    const usuario = await this.assistente.cache.get<Usuario>(id);
    if (usuario) {
      return usuario;
    }
    return this.gravacaoRepository.findOneByOrFail({ id })
      .then(usuario => {
        this.assistente.cache.set(usuario.id, usuario);
        return usuario;
      });
  }
  async salva(identificacao: Identificacao, usuario: Usuario): Promise<Usuario> {
    usuario.atuante = usuario.situacao === UsuarioSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { usuario }, {
      codigo: 'código', nome: 'nome',
    });
    for (const usuarioCredencial of usuario.usuarioCredenciais) {
      await this.assistente.unico(this.gravacaoRepository, { usuarioCredencial }, {
        chave: 'chave',
      }, {
        usuarioId: usuario.id,
      });
      if (!usuarioCredencial.senha.startsWith('$')) {
        usuarioCredencial.senha = await bcrypt.hash(usuarioCredencial.senha, 10);
      }
    }
    if (!usuario.codigo) {
      await this.assistente.sequencia(this.gravacaoRepository, usuario, '', 7);
    }
    const novo = usuario.novo;
    return this.gravacaoRepository
      .save(usuario)
      .then(async usuario => {
        await this.assistente.cache.set(usuario.id, usuario);
        await this.assistente.audita(identificacao, usuario, Modelo.Usuario, novo, 'Usuário: ' + usuario.nome);
        return usuario;
      });
  }

  async editaSenha(identificacao: Identificacao, id: string, atributos: Partial<UsuarioCredencial>): Promise<Usuario> {
    if (identificacao.usuario?.id !== id) {
      this.assistente.vetado('Apenas o próprio usuário pode alterar sua senha');
    }
    if (!atributos.chave) {
      this.assistente.incoerencia('Chave de acesso não informada');
    }
    if (!atributos.senha) {
      this.assistente.incoerencia('Senha de acesso não informada');
    }
    if (!atributos['senhaNova']) {
      this.assistente.incoerencia('Nova senha não informada');
    }
    const usuario = await this.capta(identificacao, id);
    const usuarioCredencial = usuario.usuarioCredenciais?.find(usuarioCredencial => usuarioCredencial.chave === usuarioCredencial.chave);
    if (!usuarioCredencial) {
      this.assistente.incoerencia('Credenciais inválidas');
    }
    if (!await bcrypt.compare(atributos.senha, usuarioCredencial.senha)) {
      this.assistente.vetado('Credenciais inválidas');
    }
    usuarioCredencial.senha = await bcrypt.hash(atributos['senhaNova'], 10);
    await this.salva(identificacao, usuario);
    return usuario;
  }

  async editaEmpresa(identificacao: Identificacao, id: string, parametros: { empresa: Empresa, estabelecimentoIds: string[], perfilIds: string[], associa: boolean }): Promise<Usuario> {
    const usuario = await this.leituraRepository
      .findOneOrFail({
        where: { id },
        relations: { usuarioEmpresas: { empresa: true } },
        loadEagerRelations: false,
      });
    if (!parametros.empresa) {
      this.assistente.incoerencia('Empresa inválida');
    }
    if (parametros.associa) {
      if (!usuario.usuarioEmpresas.find(usuarioEmpresa => usuarioEmpresa.empresa.id === parametros.empresa.id)) {
        const usuarioEmpresa = new UsuarioEmpresa();
        usuarioEmpresa.usuario = usuario;
        usuarioEmpresa.empresa = parametros.empresa;
        usuarioEmpresa.estabelecimentoIds = parametros.estabelecimentoIds;
        usuarioEmpresa.perfilIds = parametros.perfilIds;
        usuarioEmpresa.situacao = 1;
        this.assistente.gravacao.getRepository(UsuarioEmpresa)
          .save(usuarioEmpresa);
      }
      return usuario;
    }
    this.assistente.gravacao.getRepository(UsuarioEmpresa)
      .softDelete({ usuario: { id: usuario.id }, empresa: { id: parametros.empresa.id } });
    return usuario;
  }

  async vinculaEmpresa(identificacao: Identificacao, usuario: Usuario, empresa: Empresa): Promise<Usuario> {
    return this.gravacaoRepository.update({ id: usuario.id }, { empresa: empresa }).then(() => usuario);
  }

  async remove(identificacao: Identificacao, id: string): Promise<Usuario> {
    const usuario = await this.capta(identificacao, id);
    this.gravacaoRepository.update({ id }, { codigo: this.assistente.sid('¡') });
    return await this.gravacaoRepository
      .softRemove(usuario)
      .then(async usuario => {
        await this.assistente.cache.del(usuario.id);
        await this.assistente.auditaExclusao(identificacao, usuario, Modelo.Usuario, 'Usuário: ' + usuario.nome);
        return usuario;
      })
  }
}