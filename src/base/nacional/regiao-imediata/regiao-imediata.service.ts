import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { RegiaoImediata, RegiaoImediataSituacao } from './modelo/regiao-imediata.entity';

@Injectable()
export class RegiaoImediataService {
  constructor(
    @InjectRepository(RegiaoImediata, 'gravacao')
    private readonly gravacaoRepository: Repository<RegiaoImediata>,
    @InjectRepository(RegiaoImediata, 'leitura')
    private readonly leituraRepository: Repository<RegiaoImediata>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<RegiaoImediata>> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<RegiaoImediata> = {
      order: { situacao: 1, nome: 1 },
      relations: ['regiao', 'uf', 'regiaoIntermediaria'],
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
    if (criterios.codigo) {
      options.where.codigo = criterios.codigo.toUpperCase();
    }
    if (criterios.nome) {
      options.where.nome = Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome });
    }
    if (criterios.regiaoId) {
      options.where.regiao = { id: criterios.regiaoId };
    }
    if (criterios.regiaoCodigo) {
      options.where.regiao = { codigo: criterios.regiaoCodigo.toUpperCase() };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: criterios.ufCodigo.toUpperCase() };
    }
    if (criterios.regiaoIntermediariaId) {
      options.where.regiaoIntermediaria = { id: criterios.regiaoIntermediariaId };
    }
    if (criterios.regiaoIntermediariaCodigo) {
      options.where.regiaoIntermediaria = { codigo: criterios.regiaoIntermediariaCodigo.toUpperCase() };
    }
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<RegiaoImediata>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<RegiaoImediata> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<RegiaoImediata[]> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<RegiaoImediata> = {
      select: { id: true, codigo: true, nome: true, imagem: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    options.where = {};
    if (criterios.situacao) {
      options.where.situacao = criterios.situacao;
    }
    if (criterios.nome) {
      options.where.nome = Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome });
    }
    if (criterios.regiaoId) {
      options.where.regiao = { id: criterios.regiaoId };
    }
    if (criterios.regiaoCodigo) {
      options.where.regiao = { codigo: criterios.regiaoCodigo.toUpperCase() };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: criterios.ufCodigo.toUpperCase() };
    }
    if (criterios.regiaoIntermediariaId) {
      options.where.regiaoIntermediaria = { id: criterios.regiaoIntermediariaId };
    }
    if (criterios.regiaoIntermediariaCodigo) {
      options.where.regiaoIntermediaria = { codigo: criterios.regiaoIntermediariaCodigo.toUpperCase() };
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<RegiaoImediata[]> {
    const options: FindManyOptions<RegiaoImediata> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<RegiaoImediata> {
    const regiaoImediata = await this.assistente.cache.get<RegiaoImediata>(id);
    if (regiaoImediata) {
      return regiaoImediata;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(regiaoImediata => {
      this.assistente.cache.set(regiaoImediata.id, regiaoImediata);
      return regiaoImediata;
    });
  }
  async salva(identificacao: Identificacao, regiaoImediata: RegiaoImediata): Promise<RegiaoImediata> {
    regiaoImediata.atuante = regiaoImediata.situacao === RegiaoImediataSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { regiaoImediata }, {
      codigo: 'código', nome: 'nome'
    });
    const novo = regiaoImediata.novo;
    return this.gravacaoRepository
      .save(regiaoImediata)
      .then(async regiaoImediata => {
        await this.assistente.cache.set(regiaoImediata.id, regiaoImediata);
        await this.assistente.audita(identificacao, regiaoImediata, Modelo.RegiaoImediata, novo, 'Região Imediata: ' + regiaoImediata.nome);
        return regiaoImediata;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<RegiaoImediata> {
    const regiaoImediata = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(regiaoImediata)
      .then(async regiaoImediata => {
        await this.assistente.cache.del(regiaoImediata.id);
        await this.assistente.auditaExclusao(identificacao, regiaoImediata, Modelo.RegiaoImediata, 'Região Imediata: ' + regiaoImediata.nome);
        return regiaoImediata;
      })
  }
}