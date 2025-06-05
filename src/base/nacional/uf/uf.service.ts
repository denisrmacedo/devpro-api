import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Uf, UfSituacao } from './modelo/uf.entity';

@Injectable()
export class UfService {
  constructor(
    @InjectRepository(Uf, 'gravacao')
    private readonly gravacaoRepository: Repository<Uf>,
    @InjectRepository(Uf, 'leitura')
    private readonly leituraRepository: Repository<Uf>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Uf>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Uf> = {
      order: { situacao: 1, nome: 1 },
      relations: ['regiao'],
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
    const contagem = await this.leituraRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Uf>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Uf> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Uf[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Uf> = {
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
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Uf[]> {
    const options: FindManyOptions<Uf> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Uf> {
    const uf = await this.assistente.cache.get<Uf>(id);
    if (uf) {
      return uf;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(uf => {
      this.assistente.cache.set(uf.id, uf);
      return uf;
    });
  }
  async salva(identificacao: Identificacao, uf: Uf): Promise<Uf> {
    uf.atuante = uf.situacao === UfSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { uf }, {
      codigo: 'código', nome: 'nome', sigla: 'sigla'
    });
    const novo = uf.novo;
    return this.gravacaoRepository
      .save(uf)
      .then(async uf => {
        await this.assistente.cache.set(uf.id, uf);
        await this.assistente.audita(identificacao, uf, Modelo.Uf, novo, 'UF: ' + uf.nome);
        return uf;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Uf> {
    const uf = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(uf)
      .then(async uf => {
        await this.assistente.cache.del(uf.id);
        await this.assistente.auditaExclusao(identificacao, uf, Modelo.Uf, 'UF: ' + uf.nome);
        return uf;
      })
  }
}