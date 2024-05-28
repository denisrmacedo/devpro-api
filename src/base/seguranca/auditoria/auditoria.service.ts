import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Not, Raw, DeepPartial } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Auditoria } from './modelo/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria, 'principal') private readonly principalRepository: Repository<Auditoria>,
    @InjectRepository(Auditoria, 'replica') private readonly replicaRepository: Repository<Auditoria>,
    private readonly assistente: AssistenteService,
  ) {}

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Auditoria>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Auditoria> = {
      order: { momento: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente)
      options.order = { edicao: 1 }
    options.where = [];
    if (criterios['usuario.id'])
      options.where.push({ usuario: { id: criterios.usuario.id } });
    if (criterios['sessao.id'])
      options.where.push({ sessao: { id: criterios.sessao.id } });
    const contagem = await this.principalRepository.count(options);
    return this.replicaRepository.find(options)
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
    const contagem = await this.principalRepository.count(options);
    return this.replicaRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async procura(identificacao: Identificacao, criterios: any): Promise<Auditoria[]> {
    const options: FindManyOptions<Auditoria> = {
      order: { momento: 1 },
    };
    options.where = [];
    if (criterios['usuario.id'])
      options.where.push({ usuario: { id: criterios.usuario.id } });
    if (criterios['sessao.id'])
      options.where.push({ sessao: { id: criterios.sessao.id } });
    return this.replicaRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Auditoria> {
    const auditoria = await this.assistente.cache.get<Auditoria>(id);
    if (auditoria)
      return auditoria;
    return this.principalRepository.findOneByOrFail({ id })
      .then(auditoria => {
        this.assistente.cache.set(auditoria.id, auditoria);
        return auditoria;
      });
  }
  async salva(identificacao: Identificacao, auditoria: DeepPartial<Auditoria>): Promise<Auditoria> {
    return this.principalRepository
      .save(auditoria)
      .then(auditoria => {
        this.assistente.cache.set(auditoria.id, auditoria);
        return auditoria;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Auditoria> {
    const auditoria = await this.capta(identificacao, id);
    return await this.principalRepository
      .softRemove(auditoria)
      .then(auditoria => {
        this.assistente.cache.del(auditoria.id);
        return auditoria;
      })
  }
}