import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Not, Raw } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Usuario, UsuarioSituacao } from './modelo/usuario.entity';
import { Modelo } from 'src/base/base';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario, 'principal') private readonly principalRepository: Repository<Usuario>,
    @InjectRepository(Usuario, 'replica') private readonly replicaRepository: Repository<Usuario>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Usuario>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Usuario> = {
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente)
      options.order = { edicao: 1 }
    options.where = [];
    if (criterios.situacao)
      options.where.push({ situacao: criterios.situacao });
    if (criterios.atuante)
      options.where.push({ situacao: UsuarioSituacao.Ativo });
    if (criterios.inerte)
      options.where.push({ situacao: Not(UsuarioSituacao.Ativo) });
    if (criterios.codigo)
      options.where.push({ codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.codigo }) });
    if (criterios.nome)
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    if (criterios.email)
      options.where.push({
        id: Raw((alias) => `${alias} IN (${this.assistente.consultaIds('alfa.usuarioCredencial', 'usuarioId', { chave: criterios.email })})`)
      });
    const contagem = await this.principalRepository.count(options);
    return this.replicaRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Usuario>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Usuario> = {
      where: { edicao: MoreThan(criterios.momento) },
      order: { edicao: 1 },
      skip: criterios.salto,
      take: criterios.linhas,
    };
    const contagem = await this.principalRepository.count(options);
    return this.replicaRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async lista(identificacao: Identificacao, criterios: any): Promise<Usuario[]> {
    const options: FindManyOptions<Usuario> = {
      select: { id: true, nome: true, imagem: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    return this.replicaRepository.find(options);
  }

  async procura(identificacao: Identificacao, criterios: any): Promise<Usuario[]> {
    const options: FindManyOptions<Usuario> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.chave)
      options.where.push({ usuarioCredenciais: { chave: criterios.chave } });
    return this.replicaRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Usuario> {
    const usuario = await this.assistente.cache.get<Usuario>(id);
    if (usuario)
      return usuario;
    return this.principalRepository.findOneByOrFail({ id })
      .then(usuario => {
        this.assistente.cache.set(usuario.id, usuario);
        return usuario;
      });
  }
  async salva(identificacao: Identificacao, usuario: Usuario): Promise<Usuario> {
    usuario.numero = +usuario.codigo || -1;
    usuario.atuante = usuario.situacao === UsuarioSituacao.Ativo;
    await this.assistente.unico(this.principalRepository, { usuario }, {
      codigo: 'código', nome: 'nome', numero: 'número'
    });
    for (const usuarioCredencial of usuario.usuarioCredenciais) {
      await this.assistente.unico(this.principalRepository, { usuarioCredencial }, {
        chave: 'chave'
      });
      if (!usuarioCredencial.senha.startsWith('$')) {
        usuarioCredencial.senha = await bcrypt.hash(usuarioCredencial.senha, 10);
      }
    }
    const novo = usuario.novo;
    return this.principalRepository
      .save(usuario)
      .then(async usuario => {
        await this.assistente.cache.set(usuario.id, usuario);
        await this.assistente.audita(identificacao, this.principalRepository, usuario, Modelo.Usuario, novo, 'Usuário: ' + usuario.nome);
        return usuario;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Usuario> {
    const usuario = await this.capta(identificacao, id);
    return await this.principalRepository
      .softRemove(usuario)
      .then(async usuario => {
        await this.assistente.cache.del(usuario.id);
        await this.assistente.auditaExclusao(identificacao, this.principalRepository, usuario, Modelo.Usuario, 'Usuário: ' + usuario.nome);
        return usuario;
      })
  }
}