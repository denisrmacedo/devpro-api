import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Cnae, CnaeSituacao } from './modelo/cnae.entity';

@Injectable()
export class CnaeService {
  constructor(
    @InjectRepository(Cnae, 'gravacao')
    private readonly gravacaoRepository: Repository<Cnae>,
    @InjectRepository(Cnae, 'leitura')
    private readonly leituraRepository: Repository<Cnae>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Cnae>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Cnae> = {
      order: { situacao: 1, nivel: 1 },
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
      options.where.push({ codigo: Raw((alias) => `${alias} = upper(:codigo)`, { codigo: criterios.codigo }) });
    }
    if (criterios.nome) {
      options.where.push({ nome: Raw((alias) => `versal(${alias}) LIKE versal(:nome)`, { nome: criterios.nome }) });
    }
    const contagem = await this.leituraRepository.count(options);
    const cnaes = await this.leituraRepository.find(options);
    return this.assistente.pagina(criterios, contagem, cnaes);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Cnae>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Cnae> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Cnae[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Cnae> = {
      select: { id: true, codigo: true, nome: true, situacao: true },
      order: { situacao: 1, nivel: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Cnae[]> {
    const options: FindManyOptions<Cnae> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Cnae> {
    const cnae = await this.assistente.cache.get<Cnae>(id);
    if (cnae) {
      return cnae;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(cnae => {
      this.assistente.cache.set(cnae.id, cnae);
      return cnae;
    });
  }
  async salva(identificacao: Identificacao, cnae: Cnae): Promise<Cnae> {
    cnae.atuante = cnae.situacao === CnaeSituacao.Ativa;
    cnae.codigo = cnae.secao;
    cnae.nivel = cnae.secao;
    if (cnae.divisao) {
      cnae.codigo = cnae.divisao;
      cnae.nivel = cnae.secao + cnae.divisao;
    }
    if (cnae.grupo) {
      cnae.codigo = cnae.grupo;
      cnae.nivel = cnae.secao + cnae.grupo;
    }
    if (cnae.classe) {
      cnae.codigo = cnae.classe;
      cnae.nivel = cnae.secao + cnae.classe;
    }
    if (cnae.subclasse) {
      cnae.codigo = cnae.subclasse;
      cnae.nivel = cnae.secao + cnae.subclasse;
    }
    await this.assistente.unico(this.gravacaoRepository, { cnae }, {
      codigo: 'código', nivel: 'nivel',
    });
    const novo = cnae.novo;
    return this.gravacaoRepository
      .save(cnae)
      .then(async cnae => {
        await this.assistente.cache.set(cnae.id, cnae);
        await this.assistente.audita(identificacao, cnae, Modelo.Cnae, novo, 'CNAE: ' + cnae.nome);
        return cnae;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Cnae> {
    const cnae = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(cnae)
      .then(async cnae => {
        await this.assistente.cache.del(cnae.id);
        await this.assistente.auditaExclusao(identificacao, cnae, Modelo.Cnae, 'CNAE: ' + cnae.nome);
        return cnae;
      })
  }
}