import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Mesorregiao, MesorregiaoSituacao } from './modelo/mesorregiao.entity';

@Injectable()
export class MesorregiaoService {
  constructor(
    @InjectRepository(Mesorregiao, 'gravacao')
    private readonly gravacaoRepository: Repository<Mesorregiao>,
    @InjectRepository(Mesorregiao, 'leitura')
    private readonly leituraRepository: Repository<Mesorregiao>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Mesorregiao>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Mesorregiao> = {
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
      options.where.regiao = { codigo: Raw((alias) => `${alias} = upper(:regiaoCodigo)`, { regiaoCodigo: criterios.regiaoCodigo }) };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: Raw((alias) => `${alias} = upper(:ufCodigo)`, { ufCodigo: criterios.ufCodigo }) };
    }
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Mesorregiao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Mesorregiao> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Mesorregiao[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Mesorregiao> = {
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
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Mesorregiao[]> {
    const options: FindManyOptions<Mesorregiao> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Mesorregiao> {
    const mesorregiao = await this.assistente.cache.get<Mesorregiao>(id);
    if (mesorregiao) {
      return mesorregiao;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(mesorregiao => {
      this.assistente.cache.set(mesorregiao.id, mesorregiao);
      return mesorregiao;
    });
  }
  async salva(identificacao: Identificacao, mesorregiao: Mesorregiao): Promise<Mesorregiao> {
    mesorregiao.atuante = mesorregiao.situacao === MesorregiaoSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { mesorregiao }, {
      codigo: 'código', nome: 'nome'
    });
    const novo = mesorregiao.novo;
    return this.gravacaoRepository
      .save(mesorregiao)
      .then(async mesorregiao => {
        await this.assistente.cache.set(mesorregiao.id, mesorregiao);
        await this.assistente.audita(identificacao, mesorregiao, Modelo.Mesorregiao, novo, 'Mesorregião: ' + mesorregiao.nome);
        return mesorregiao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Mesorregiao> {
    const mesorregiao = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(mesorregiao)
      .then(async mesorregiao => {
        await this.assistente.cache.del(mesorregiao.id);
        await this.assistente.auditaExclusao(identificacao, mesorregiao, Modelo.Mesorregiao, 'Mesorregião: ' + mesorregiao.nome);
        return mesorregiao;
      })
  }
}