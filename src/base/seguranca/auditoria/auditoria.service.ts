import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Not, Raw, DeepPartial } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Auditoria } from './modelo/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria, 'gravacao')
    private readonly gravacaoRepository: Repository<Auditoria>,
    @InjectRepository(Auditoria, 'leitura')
    private readonly leituraRepository: Repository<Auditoria>,
    private readonly assistente: AssistenteService,
  ) {}

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Auditoria>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Auditoria> = {
      order: { instante: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente)
      options.order = { edicao: 1 }
    options.where = {};
    if (criterios['usuario.id'])
      options.where.usuario = { id: criterios.usuario.id };
    if (criterios['autorizacao.id'])
      options.where.autorizacao = { id: criterios.autorizacao.id };
    const contagem = await this.gravacaoRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Auditoria>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Auditoria> = {
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

  async busca(identificacao: Identificacao, criterios: any): Promise<Auditoria[]> {
    const options: FindManyOptions<Auditoria> = {
      order: { instante: 1 },
    };
    options.where = {};
    if (criterios['usuario.id'])
      options.where.usuario = { id: criterios.usuario.id };
    if (criterios['autorizacao.id'])
      options.where.autorizacao = { id: criterios.autorizacao.id };
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Auditoria> {
    const auditoria = await this.assistente.cache.get<Auditoria>(id);
    if (auditoria)
      return auditoria;
    return this.gravacaoRepository.findOneByOrFail({ id })
      .then(auditoria => {
        this.assistente.cache.set(auditoria.id, auditoria);
        return auditoria;
      });
  }
  async salva(identificacao: Identificacao, auditoria: DeepPartial<Auditoria>): Promise<Auditoria> {
    return this.gravacaoRepository
      .save(auditoria)
      .then(auditoria => {
        this.assistente.cache.set(auditoria.id, auditoria);
        return auditoria;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Auditoria> {
    const auditoria = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(auditoria)
      .then(auditoria => {
        this.assistente.cache.del(auditoria.id);
        return auditoria;
      })
  }
}