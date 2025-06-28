import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, DeepPartial, DataSource } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Autorizacao, AutorizacaoSituacao } from './modelo/autorizacao.entity';

@Injectable()
export class AutorizacaoService {
  constructor(
    @InjectRepository(Autorizacao, 'gravacao')
    private readonly gravacaoRepository: Repository<Autorizacao>,
    @InjectRepository(Autorizacao, 'leitura')
    private readonly leituraRepository: Repository<Autorizacao>,
    private readonly assistente: AssistenteService,
  ) {}

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Autorizacao>> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<Autorizacao> = {
      order: { inicio: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = {};
    if (criterios.situacao) {
      options.where.situacao = criterios.situacao;
    }
    if (criterios['usuario.id']) {
      options.where.usuario = { id: criterios.usuario.id };
    }
    const contagem = await this.gravacaoRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Autorizacao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Autorizacao> = {
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

  async busca(identificacao: Identificacao, criterios: any): Promise<Autorizacao[]> {
    const options: FindManyOptions<Autorizacao> = {
      order: { adicao: 1 },
    };
    options.where = {};
    if (criterios['usuario.id']) {
      options.where.usuario = { id: criterios.usuario.id };
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Autorizacao> {
    const autorizacao = await this.assistente.cache.get<Autorizacao>(id);
    if (autorizacao)
      return autorizacao;
    return this.gravacaoRepository.findOneByOrFail({ id })
      .then(autorizacao => {
        this.assistente.cache.set(autorizacao.id, autorizacao);
        return autorizacao;
      });
  }
  async salva(identificacao: Identificacao, autorizacao: DeepPartial<Autorizacao>): Promise<Autorizacao> {
    autorizacao.atuante = autorizacao.situacao === AutorizacaoSituacao.Ativa;
    return this.gravacaoRepository
      .save(autorizacao)
      .then(autorizacao => {
        this.assistente.cache.set(autorizacao.id, autorizacao);
        return autorizacao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Autorizacao> {
    const autorizacao = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(autorizacao)
      .then(autorizacao => {
        this.assistente.cache.del(autorizacao.id);
        return autorizacao;
      })
  }
}