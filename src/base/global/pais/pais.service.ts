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
    const contagem = await this.leituraRepository.count(options);
    const query = this.leituraRepository
      .createQueryBuilder('pais')
      .orderBy(`(iso2 <> '${identificacao.nacao}')::int`)
      .addOrderBy('pais.nome')
      .take(criterios.linhas)
      .skip(criterios.salto);
    if (criterios.situacao) {
      query.andWhere({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      query.andWhere({ codigo: criterios.codigo.toUpperCase() });
    }
    if (criterios.nome) {
      query.andWhere({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const paises = await query.getMany().then(
      paises => {
        if (criterios.pagina === 1) {
          for (const pais of paises) {
            if (pais.iso2 === identificacao.nacao) {
              pais['destaque'] = true;
            }
            break;
          }
        }
        return paises;
      }
    );
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
    const query = this.leituraRepository
      .createQueryBuilder('pais')
      .select(['id', 'codigo', 'nome', 'imagem', 'situacao'])
      .orderBy(`(iso2 <> '${identificacao.nacao}')::int`)
      .addOrderBy('pais.nome');
    if (criterios.atuante) {
      query.andWhere({ atuante: true });
    }
    const paises = await query.getMany();
    // const paises = await query.getMany().then(
    //   paises => {
    //     for (const pais of paises) {
    //       if (pais.iso2 === identificacao.nacao) {
    //         pais['destaque'] = true;
    //       }
    //       break;
    //     }
    //     return paises;
    //   }
    // );
    return paises;
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Pais[]> {
    const options: FindManyOptions<Pais> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
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