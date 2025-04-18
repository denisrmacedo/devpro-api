import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Pais, PaisSituacao } from './modelo/pais.entity';

@Injectable()
export class PaisService {
  constructor(
    @InjectRepository(Pais, 'gravacao')
    private readonly gravacaoRepository: Repository<Pais>,
    @InjectRepository(Pais, 'leitura')
    private readonly leituraRepository: Repository<Pais>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Pais>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Pais> = {
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = [];
    if (criterios.situacao) {
      options.where.push({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      options.where.push({ codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.codigo }) });
    }
    if (criterios.nome) {
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const contagem = await this.leituraRepository.count(options);
    const paises = await this.leituraRepository.find(options);
    return this.assistente.pagina(criterios, contagem, paises);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Pais>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Pais> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Pais[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Pais> = {
      select: { id: true, codigo: true, nome: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Pais[]> {
    const options: FindManyOptions<Pais> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Pais> {
    const pais = await this.assistente.cache.get<Pais>(id);
    if (pais) {
      return pais;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(pais => {
      this.assistente.cache.set(pais.id, pais);
      return pais;
    });
  }
  async salva(identificacao: Identificacao, pais: Pais): Promise<Pais> {
    pais.atuante = pais.situacao === PaisSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { pais }, {
      codigo: 'código', nome: 'nome', iso2: 'iso2', iso3: 'iso3', tld: 'tld'
    });
    const novo = pais.novo;
    return this.gravacaoRepository
      .save(pais)
      .then(async pais => {
        await this.assistente.cache.set(pais.id, pais);
        await this.assistente.audita(identificacao, pais, Modelo.Pais, novo, 'País: ' + pais.nome);
        return pais;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Pais> {
    const pais = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(pais)
      .then(async pais => {
        await this.assistente.cache.del(pais.id);
        await this.assistente.auditaExclusao(identificacao, pais, Modelo.Pais, 'País: ' + pais.nome);
        return pais;
      })
  }
}