import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Microrregiao, MicrorregiaoSituacao } from './modelo/microrregiao.entity';

@Injectable()
export class MicrorregiaoService {
  constructor(
    @InjectRepository(Microrregiao, 'gravacao')
    private readonly gravacaoRepository: Repository<Microrregiao>,
    @InjectRepository(Microrregiao, 'leitura')
    private readonly leituraRepository: Repository<Microrregiao>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Microrregiao>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Microrregiao> = {
      order: { situacao: 1, nome: 1 },
      relations: ['regiao', 'uf'],
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
    if (criterios.mesorregiaoId) {
      options.where.mesorregiao = { id: criterios.mesorregiaoId };
    }
    if (criterios.mesorregiaoCodigo) {
      options.where.mesorregiao = { codigo: criterios.mesorregiaoCodigo.toUpperCase() };
    }
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Microrregiao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Microrregiao> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Microrregiao[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Microrregiao> = {
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
      options.where.regiao = { codigo: Raw((alias) => `${alias} = upper(:regiaoCodigo)`, { regiaoCodigo: criterios.regiaoCodigo }) };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: Raw((alias) => `${alias} = upper(:ufCodigo)`, { ufCodigo: criterios.ufCodigo }) };
    }
    if (criterios.mesorregiaoId) {
      options.where.mesorregiao = { id: criterios.mesorregiaoId };
    }
    if (criterios.mesorregiaoCodigo) {
      options.where.mesorregiao = { codigo: Raw((alias) => `${alias} = upper(:mesorregiaoCodigo)`, { mesorregiaoCodigo: criterios.mesorregiaoCodigo }) };
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Microrregiao[]> {
    const options: FindManyOptions<Microrregiao> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Microrregiao> {
    const microrregiao = await this.assistente.cache.get<Microrregiao>(id);
    if (microrregiao) {
      return microrregiao;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(microrregiao => {
      this.assistente.cache.set(microrregiao.id, microrregiao);
      return microrregiao;
    });
  }
  async salva(identificacao: Identificacao, microrregiao: Microrregiao): Promise<Microrregiao> {
    microrregiao.atuante = microrregiao.situacao === MicrorregiaoSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { microrregiao }, {
      codigo: 'código', nome: 'nome'
    });
    const novo = microrregiao.novo;
    return this.gravacaoRepository
      .save(microrregiao)
      .then(async microrregiao => {
        await this.assistente.cache.set(microrregiao.id, microrregiao);
        await this.assistente.audita(identificacao, microrregiao, Modelo.Microrregiao, novo, 'Mesorregião: ' + microrregiao.nome);
        return microrregiao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Microrregiao> {
    const microrregiao = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(microrregiao)
      .then(async microrregiao => {
        await this.assistente.cache.del(microrregiao.id);
        await this.assistente.auditaExclusao(identificacao, microrregiao, Modelo.Microrregiao, 'Mesorregião: ' + microrregiao.nome);
        return microrregiao;
      })
  }
}