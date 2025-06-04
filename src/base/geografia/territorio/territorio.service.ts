import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Territorio, TerritorioSituacao } from './modelo/territorio.entity';

@Injectable()
export class TerritorioService {
  constructor(
    @InjectRepository(Territorio, 'gravacao')
    private readonly gravacaoRepository: Repository<Territorio>,
    @InjectRepository(Territorio, 'leitura')
    private readonly leituraRepository: Repository<Territorio>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Territorio>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Territorio> = {
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = [];
    if (criterios.paisId) {
      options.where.push({ pais: { id: criterios.paisId } });
    }
    if (criterios.situacao) {
      options.where.push({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      options.where.push({ codigo: Raw((alias) => `${alias} = upper(:codigo)`, { codigo: criterios.codigo }) });
    }
    if (criterios.nome) {
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const contagem = await this.leituraRepository.count(options);
    const territorioes = await this.leituraRepository.find(options);
    return this.assistente.pagina(criterios, contagem, territorioes);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Territorio>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Territorio> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Territorio[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Territorio> = {
      select: { id: true, codigo: true, nome: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    options.where = [];
    if (criterios.paisId) {
      options.where.push({ pais: { id: criterios.paisId } });
    }
    if (criterios.atuante) {
      options.where.push({ atuante: true });
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Territorio[]> {
    const options: FindManyOptions<Territorio> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.paisId) {
      options.where.push({ pais: { id: criterios.paisId } });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Territorio> {
    const territorio = await this.assistente.cache.get<Territorio>(id);
    if (territorio) {
      return territorio;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(territorio => {
      this.assistente.cache.set(territorio.id, territorio);
      return territorio;
    });
  }
  async salva(identificacao: Identificacao, territorio: Territorio): Promise<Territorio> {
    territorio.atuante = territorio.situacao === TerritorioSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { territorio }, {
      codigo: 'código', nome: 'nome', iso2: 'iso2', iso3: 'iso3', tld: 'tld'
    });
    const novo = territorio.novo;
    return this.gravacaoRepository
      .save(territorio)
      .then(async territorio => {
        await this.assistente.cache.set(territorio.id, territorio);
        await this.assistente.audita(identificacao, territorio, Modelo.Territorio, novo, 'Território: ' + territorio.nome);
        return territorio;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Territorio> {
    const territorio = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(territorio)
      .then(async territorio => {
        await this.assistente.cache.del(territorio.id);
        await this.assistente.auditaExclusao(identificacao, territorio, Modelo.Territorio, 'Território: ' + territorio.nome);
        return territorio;
      })
  }
}