import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Municipio, MunicipioSituacao } from './modelo/municipio.entity';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(Municipio, 'gravacao')
    private readonly gravacaoRepository: Repository<Municipio>,
    @InjectRepository(Municipio, 'leitura')
    private readonly leituraRepository: Repository<Municipio>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Municipio>> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<Municipio> = {
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
    if (criterios.microrregiaoId) {
      options.where.microrregiao = { id: criterios.microrregiaoId };
    }
    if (criterios.microrregiaoCodigo) {
      options.where.microrregiao = { codigo: criterios.microrregiaoCodigo.toUpperCase() };
    }
    if (criterios.regiaoIntermediariaId) {
      options.where.regiaoIntermediaria = { id: criterios.regiaoIntermediariaId };
    }
    if (criterios.regiaoIntermediariaCodigo) {
      options.where.regiaoIntermediaria = { codigo: criterios.regiaoIntermediariaCodigo.toUpperCase() };
    }
    if (criterios.regiaoImediataId) {
      options.where.regiaoImediata = { id: criterios.regiaoImediataId };
    }
    if (criterios.regiaoImediataCodigo) {
      options.where.regiaoImediata = { codigo: criterios.regiaoImediataCodigo.toUpperCase() };
    }
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Municipio>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Municipio> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Municipio[]> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<Municipio> = {
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
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Municipio[]> {
    const options: FindManyOptions<Municipio> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Municipio> {
    const municipio = await this.assistente.cache.get<Municipio>(id);
    if (municipio) {
      return municipio;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(municipio => {
      this.assistente.cache.set(municipio.id, municipio);
      return municipio;
    });
  }
  async salva(identificacao: Identificacao, municipio: Municipio): Promise<Municipio> {
    municipio.atuante = municipio.situacao === MunicipioSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { municipio }, {
      codigo: 'código'
    });
    const novo = municipio.novo;
    return this.gravacaoRepository
      .save(municipio)
      .then(async municipio => {
        await this.assistente.cache.set(municipio.id, municipio);
        await this.assistente.audita(identificacao, municipio, Modelo.Municipio, novo, 'Município: ' + municipio.nome);
        return municipio;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Municipio> {
    const municipio = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(municipio)
      .then(async municipio => {
        await this.assistente.cache.del(municipio.id);
        await this.assistente.auditaExclusao(identificacao, municipio, Modelo.Municipio, 'Município: ' + municipio.nome);
        return municipio;
      })
  }
}