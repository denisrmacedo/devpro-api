import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Regiao, RegiaoSituacao } from './modelo/regiao.entity';

@Injectable()
export class RegiaoService {
  constructor(
    @InjectRepository(Regiao, 'gravacao')
    private readonly gravacaoRepository: Repository<Regiao>,
    @InjectRepository(Regiao, 'leitura')
    private readonly leituraRepository: Repository<Regiao>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Regiao>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Regiao> = {
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
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Regiao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Regiao> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Regiao[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Regiao> = {
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
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Regiao[]> {
    const options: FindManyOptions<Regiao> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Regiao> {
    const regiao = await this.assistente.cache.get<Regiao>(id);
    if (regiao) {
      return regiao;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(regiao => {
      this.assistente.cache.set(regiao.id, regiao);
      return regiao;
    });
  }
  async salva(identificacao: Identificacao, regiao: Regiao): Promise<Regiao> {
    regiao.atuante = regiao.situacao === RegiaoSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { regiao }, {
      codigo: 'código', nome: 'nome', sigla: 'sigla'
    });
    const novo = regiao.novo;
    return this.gravacaoRepository
      .save(regiao)
      .then(async regiao => {
        await this.assistente.cache.set(regiao.id, regiao);
        await this.assistente.audita(identificacao, regiao, Modelo.Regiao, novo, 'Região: ' + regiao.nome);
        return regiao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Regiao> {
    const regiao = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(regiao)
      .then(async regiao => {
        await this.assistente.cache.del(regiao.id);
        await this.assistente.auditaExclusao(identificacao, regiao, Modelo.Regiao, 'Região: ' + regiao.nome);
        return regiao;
      })
  }
}