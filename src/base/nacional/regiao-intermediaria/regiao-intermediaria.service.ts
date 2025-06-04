import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { RegiaoIntermediaria, RegiaoIntermediariaSituacao } from './modelo/regiao-intermediaria.entity';

@Injectable()
export class RegiaoIntermediariaService {
  constructor(
    @InjectRepository(RegiaoIntermediaria, 'gravacao')
    private readonly gravacaoRepository: Repository<RegiaoIntermediaria>,
    @InjectRepository(RegiaoIntermediaria, 'leitura')
    private readonly leituraRepository: Repository<RegiaoIntermediaria>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<RegiaoIntermediaria>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<RegiaoIntermediaria> = {
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
      options.where.codigo = Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.codigo });
    }
    if (criterios.nome) {
      options.where.nome = Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome });
    }
    if (criterios.regiaoId) {
      options.where.regiao = { id: criterios.regiaoId };
    }
    if (criterios.regiaoCodigo) {
      options.where.regiao = { codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.regiaoCodigo }) };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.ufCodigo }) };
    }
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<RegiaoIntermediaria>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<RegiaoIntermediaria> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<RegiaoIntermediaria[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<RegiaoIntermediaria> = {
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
      options.where.regiao = { codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.regiaoCodigo }) };
    }
    if (criterios.ufId) {
      options.where.uf = { id: criterios.ufId };
    }
    if (criterios.ufCodigo) {
      options.where.uf = { codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.ufCodigo }) };
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<RegiaoIntermediaria[]> {
    const options: FindManyOptions<RegiaoIntermediaria> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<RegiaoIntermediaria> {
    const regiaoIntermediaria = await this.assistente.cache.get<RegiaoIntermediaria>(id);
    if (regiaoIntermediaria) {
      return regiaoIntermediaria;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(regiaoIntermediaria => {
      this.assistente.cache.set(regiaoIntermediaria.id, regiaoIntermediaria);
      return regiaoIntermediaria;
    });
  }
  async salva(identificacao: Identificacao, regiaoIntermediaria: RegiaoIntermediaria): Promise<RegiaoIntermediaria> {
    regiaoIntermediaria.atuante = regiaoIntermediaria.situacao === RegiaoIntermediariaSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { regiaoIntermediaria }, {
      codigo: 'código', nome: 'nome'
    });
    const novo = regiaoIntermediaria.novo;
    return this.gravacaoRepository
      .save(regiaoIntermediaria)
      .then(async regiaoIntermediaria => {
        await this.assistente.cache.set(regiaoIntermediaria.id, regiaoIntermediaria);
        await this.assistente.audita(identificacao, regiaoIntermediaria, Modelo.RegiaoIntermediaria, novo, 'Mesorregião: ' + regiaoIntermediaria.nome);
        return regiaoIntermediaria;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<RegiaoIntermediaria> {
    const regiaoIntermediaria = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(regiaoIntermediaria)
      .then(async regiaoIntermediaria => {
        await this.assistente.cache.del(regiaoIntermediaria.id);
        await this.assistente.auditaExclusao(identificacao, regiaoIntermediaria, Modelo.RegiaoIntermediaria, 'Mesorregião: ' + regiaoIntermediaria.nome);
        return regiaoIntermediaria;
      })
  }
}