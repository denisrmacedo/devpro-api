import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Filial, FilialSituacao } from './modelo/filial.entity';

@Injectable()
export class FilialService {
  constructor(
    @InjectRepository(Filial, 'gravacao')
    private readonly gravacaoRepository: Repository<Filial>,
    @InjectRepository(Filial, 'leitura')
    private readonly leituraRepository: Repository<Filial>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Filial>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Filial> = {
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = {};
    options.where.organizacao = { id: identificacao.organizacao.id };
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
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Filial>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Filial> = {
      where: {
        organizacao: { id: identificacao.organizacao.id },
        edicao: MoreThan(criterios.momento),
      },
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Filial[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Filial> = {
      select: { id: true, nome: true, situacao: true },
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
    };
    criterios.organizacaoId ??= identificacao.organizacao.id;
    options.where = [{ organizacao: { id: criterios.organizacaoId }}];
    if (criterios.atuante) {
      options.where.push({ atuante: true });
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Filial[]> {
    const options: FindManyOptions<Filial> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    if (criterios.super === '1') {
      options.where.super = true;
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Filial> {
    // const filial = await this.assistente.cache.get<Filial>(id);
    // if (filial) {
    //   return filial;
    // }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(filial => {
      this.assistente.cache.set(filial.id, filial);
      return filial;
    });
  }
  async salva(identificacao: Identificacao, filial: Filial): Promise<Filial> {
    filial.atuante = filial.situacao === FilialSituacao.Ativa;
    await this.assistente.unicoOrganizacao(this.gravacaoRepository, identificacao.organizacao, { filial }, {
      codigo: 'código', nome: 'nome',
    });
    if (!filial.codigo) {
      await this.assistente.sequenciaOrganizacao(this.gravacaoRepository, filial, filial.organizacao, '', 3);
    }
    const novo = filial.novo;
    return this.gravacaoRepository
      .save(filial)
      .then(async filial => {
        await this.assistente.cache.set(filial.id, filial);
        await this.assistente.audita(identificacao, filial, Modelo.Filial, novo, 'Filial: ' + filial.nome);
        return filial;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Filial> {
    const filial = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(filial)
      .then(async filial => {
        await this.assistente.cache.del(filial.id);
        await this.assistente.auditaExclusao(identificacao, filial, Modelo.Filial, 'Filial: ' + filial.nome);
        return filial;
      });
  }
}