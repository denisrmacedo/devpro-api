import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Not, Raw, DeepPartial } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Sessao, SessaoSituacao } from './modelo/sessao.entity';

@Injectable()
export class SessaoService {
  constructor(
    @InjectRepository(Sessao, 'principal') private readonly principalRepository: Repository<Sessao>,
    @InjectRepository(Sessao, 'replica') private readonly replicaRepository: Repository<Sessao>,
    private readonly assistente: AssistenteService,
  ) {}

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Sessao>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Sessao> = {
      order: { inicio: 1 },
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
      options.where.push({ situacao: SessaoSituacao.Ativa });
    if (criterios.inerte)
      options.where.push({ situacao: Not(SessaoSituacao.Ativa) });
    if (criterios['usuario.id'])
      options.where.push({ usuario: { id: criterios.usuario.id } });
    const contagem = await this.principalRepository.count(options);
    return this.replicaRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Sessao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Sessao> = {
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

  async procura(identificacao: Identificacao, criterios: any): Promise<Sessao[]> {
    const options: FindManyOptions<Sessao> = {
      order: { adicao: 1 },
    };
    options.where = [];
    if (criterios['usuario.id'])
      options.where.push({ usuario: { id: criterios.usuario.id } });
    return this.replicaRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Sessao> {
    const sessao = await this.assistente.cache.get<Sessao>(id);
    if (sessao)
      return sessao;
    return this.principalRepository.findOneByOrFail({ id })
      .then(sessao => {
        this.assistente.cache.set(sessao.id, sessao);
        return sessao;
      });
  }
  async salva(identificacao: Identificacao, sessao: DeepPartial<Sessao>): Promise<Sessao> {
    sessao.operacional = sessao.situacao === SessaoSituacao.Ativa;
    return this.principalRepository
      .save(sessao)
      .then(sessao => {
        this.assistente.cache.set(sessao.id, sessao);
        return sessao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Sessao> {
    const sessao = await this.capta(identificacao, id);
    return await this.principalRepository
      .softRemove(sessao)
      .then(sessao => {
        this.assistente.cache.del(sessao.id);
        return sessao;
      })
  }
}