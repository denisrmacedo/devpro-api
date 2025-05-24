import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Ddi, DdiSituacao } from './modelo/ddi.entity';

@Injectable()
export class DdiService {
  constructor(
    @InjectRepository(Ddi, 'gravacao')
    private readonly gravacaoRepository: Repository<Ddi>,
    @InjectRepository(Ddi, 'leitura')
    private readonly leituraRepository: Repository<Ddi>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Ddi>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Ddi> = {
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
    const query = this.leituraRepository
      .createQueryBuilder('ddi')
      .orderBy(`(iso2 <> '${identificacao.nacao}')::int`)
      .addOrderBy('ddi.nome')
      .take(criterios.linhas)
      .skip(criterios.salto);
    if (criterios.situacao) {
      query.andWhere({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      query.andWhere({ codigo: Raw((alias) => `versal(${alias}) = versal(:codigo)`, { codigo: criterios.codigo }) });
    }
    if (criterios.nome) {
      query.andWhere({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const ddis = await query.getMany().then(
      ddis => {
        if (criterios.pagina === 1) {
          for (const ddi of ddis) {
            if (ddi.iso2 === identificacao.nacao) {
              ddi['destaque'] = true;
            }
            break;
          }
        }
        return ddis;
      }
    );
    return this.assistente.pagina(criterios, contagem, ddis);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Ddi>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Ddi> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Ddi[]> {
    this.assistente.adapta(criterios);
    const query = this.leituraRepository
      .createQueryBuilder('ddi')
      .select(['id', 'codigo', 'nome', 'imagem', 'situacao'])
      .orderBy(`(iso2 <> '${identificacao.nacao}')::int`)
      .addOrderBy('ddi.nome');
    if (criterios.atuante) {
      query.andWhere({ atuante: true });
    }
    return query.getMany();
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Ddi[]> {
    const options: FindManyOptions<Ddi> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Ddi> {
    const ddi = await this.assistente.cache.get<Ddi>(id);
    if (ddi) {
      return ddi;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(ddi => {
      this.assistente.cache.set(ddi.id, ddi);
      return ddi;
    });
  }
  async salva(identificacao: Identificacao, ddi: Ddi): Promise<Ddi> {
    ddi.atuante = ddi.situacao === DdiSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { ddi }, {
      codigo: 'código', nome: 'nome', iso2: 'iso2', iso3: 'iso3', tld: 'tld'
    });
    const novo = ddi.novo;
    return this.gravacaoRepository
      .save(ddi)
      .then(async ddi => {
        await this.assistente.cache.set(ddi.id, ddi);
        await this.assistente.audita(identificacao, ddi, Modelo.Ddi, novo, 'País: ' + ddi.nome);
        return ddi;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Ddi> {
    const ddi = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(ddi)
      .then(async ddi => {
        await this.assistente.cache.del(ddi.id);
        await this.assistente.auditaExclusao(identificacao, ddi, Modelo.Ddi, 'País: ' + ddi.nome);
        return ddi;
      })
  }
}