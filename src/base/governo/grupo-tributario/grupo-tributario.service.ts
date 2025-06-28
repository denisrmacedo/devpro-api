import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { GrupoTributario, GrupoTributarioSituacao } from './modelo/grupo-tributario.entity';

@Injectable()
export class GrupoTributarioService {
  constructor(
    @InjectRepository(GrupoTributario, 'gravacao')
    private readonly gravacaoRepository: Repository<GrupoTributario>,
    @InjectRepository(GrupoTributario, 'leitura')
    private readonly leituraRepository: Repository<GrupoTributario>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<GrupoTributario>> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<GrupoTributario> = {
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
    const naturezasJuridicas = await this.leituraRepository.find(options);
    return this.assistente.pagina(criterios, contagem, naturezasJuridicas);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<GrupoTributario>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<GrupoTributario> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<GrupoTributario[]> {
    this.assistente.adapta(identificacao, criterios);
    const options: FindManyOptions<GrupoTributario> = {
      select: { id: true, codigo: true, nome: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<GrupoTributario[]> {
    const options: FindManyOptions<GrupoTributario> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = {};
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<GrupoTributario> {
    const grupoTributario = await this.assistente.cache.get<GrupoTributario>(id);
    if (grupoTributario) {
      return grupoTributario;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(grupoTributario => {
      this.assistente.cache.set(grupoTributario.id, grupoTributario);
      return grupoTributario;
    });
  }
  async salva(identificacao: Identificacao, grupoTributario: GrupoTributario): Promise<GrupoTributario> {
    grupoTributario.atuante = grupoTributario.situacao === GrupoTributarioSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { grupoTributario }, {
      codigo: 'codigo', nome: 'nome',
    });
    if (!grupoTributario.codigo) {
      await this.assistente.sequencia(this.gravacaoRepository, grupoTributario, '', 3);
    }
    const novo = grupoTributario.novo;
    return this.gravacaoRepository
      .save(grupoTributario)
      .then(async grupoTributario => {
        await this.assistente.cache.set(grupoTributario.id, grupoTributario);
        await this.assistente.audita(identificacao, grupoTributario, Modelo.GrupoTributario, novo, 'Grupo Tributário: ' + grupoTributario.nome);
        return grupoTributario;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<GrupoTributario> {
    const grupoTributario = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(grupoTributario)
      .then(async grupoTributario => {
        await this.assistente.cache.del(grupoTributario.id);
        await this.assistente.auditaExclusao(identificacao, grupoTributario, Modelo.GrupoTributario, 'Grupo Tributário: ' + grupoTributario.nome);
        return grupoTributario;
      })
  }
}