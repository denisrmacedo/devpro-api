import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Estabelecimento, EstabelecimentoSituacao } from './modelo/estabelecimento.entity';

@Injectable()
export class EstabelecimentoService {
  constructor(
    @InjectRepository(Estabelecimento, 'gravacao')
    private readonly gravacaoRepository: Repository<Estabelecimento>,
    @InjectRepository(Estabelecimento, 'leitura')
    private readonly leituraRepository: Repository<Estabelecimento>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Estabelecimento>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Estabelecimento> = {
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = [{ empresa: { id: identificacao.empresa.id } }];
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
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Estabelecimento>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Estabelecimento> = {
      where: {
        empresa: { id: identificacao.empresa.id },
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Estabelecimento[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Estabelecimento> = {
      select: { id: true, nome: true, situacao: true },
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
    };
    criterios.empresaId ??= identificacao.empresa.id;
    options.where = [{ empresa: { id: criterios.empresaId }}];
    if (criterios.atuante) {
      options.where.push({ atuante: true });
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Estabelecimento[]> {
    const options: FindManyOptions<Estabelecimento> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.super === '1') {
      options.where.push({ super: true });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Estabelecimento> {
    // const estabelecimento = await this.assistente.cache.get<Estabelecimento>(id);
    // if (estabelecimento) {
    //   return estabelecimento;
    // }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(estabelecimento => {
      this.assistente.cache.set(estabelecimento.id, estabelecimento);
      return estabelecimento;
    });
  }
  async salva(identificacao: Identificacao, estabelecimento: Estabelecimento): Promise<Estabelecimento> {
    estabelecimento.atuante = estabelecimento.situacao === EstabelecimentoSituacao.Ativo;
    await this.assistente.unicoEmpresa(this.gravacaoRepository, identificacao.empresa, { estabelecimento }, {
      codigo: 'código', nome: 'nome',
    });
    if (!estabelecimento.codigo) {
      await this.assistente.sequenciaEmpresa(this.gravacaoRepository, estabelecimento, estabelecimento.empresa, '', 3);
    }
    const novo = estabelecimento.novo;
    return this.gravacaoRepository
      .save(estabelecimento)
      .then(async estabelecimento => {
        await this.assistente.cache.set(estabelecimento.id, estabelecimento);
        await this.assistente.audita(identificacao, estabelecimento, Modelo.Estabelecimento, novo, 'Estabelecimento: ' + estabelecimento.nome);
        return estabelecimento;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Estabelecimento> {
    const estabelecimento = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(estabelecimento)
      .then(async estabelecimento => {
        await this.assistente.cache.del(estabelecimento.id);
        await this.assistente.auditaExclusao(identificacao, estabelecimento, Modelo.Estabelecimento, 'Estabelecimento: ' + estabelecimento.nome);
        return estabelecimento;
      });
  }
}