import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { NaturezaJuridica, NaturezaJuridicaSituacao } from './modelo/natureza-juridica.entity';

@Injectable()
export class NaturezaJuridicaService {
  constructor(
    @InjectRepository(NaturezaJuridica, 'gravacao')
    private readonly gravacaoRepository: Repository<NaturezaJuridica>,
    @InjectRepository(NaturezaJuridica, 'leitura')
    private readonly leituraRepository: Repository<NaturezaJuridica>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<NaturezaJuridica>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<NaturezaJuridica> = {
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
    const naturezasJuridicas = await this.leituraRepository.find(options);
    return this.assistente.pagina(criterios, contagem, naturezasJuridicas);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<NaturezaJuridica>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<NaturezaJuridica> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<NaturezaJuridica[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<NaturezaJuridica> = {
      select: { id: true, codigo: true, nome: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<NaturezaJuridica[]> {
    const options: FindManyOptions<NaturezaJuridica> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<NaturezaJuridica> {
    const naturezaJuridica = await this.assistente.cache.get<NaturezaJuridica>(id);
    if (naturezaJuridica) {
      return naturezaJuridica;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(naturezaJuridica => {
      this.assistente.cache.set(naturezaJuridica.id, naturezaJuridica);
      return naturezaJuridica;
    });
  }
  async salva(identificacao: Identificacao, naturezaJuridica: NaturezaJuridica): Promise<NaturezaJuridica> {
    naturezaJuridica.atuante = naturezaJuridica.situacao === NaturezaJuridicaSituacao.Ativa;
    naturezaJuridica.codigo = naturezaJuridica.secao;
    naturezaJuridica.nivel = naturezaJuridica.secao;
    if (naturezaJuridica.classe) {
      naturezaJuridica.codigo = naturezaJuridica.classe;
      naturezaJuridica.nivel = naturezaJuridica.secao + naturezaJuridica.classe;
    }
    await this.assistente.unico(this.gravacaoRepository, { naturezaJuridica }, {
      codigo: 'código', nivel: 'nivel',
    });
    const novo = naturezaJuridica.novo;
    return this.gravacaoRepository
      .save(naturezaJuridica)
      .then(async naturezaJuridica => {
        await this.assistente.cache.set(naturezaJuridica.id, naturezaJuridica);
        await this.assistente.audita(identificacao, naturezaJuridica, Modelo.NaturezaJuridica, novo, 'Natureza Jurídica: ' + naturezaJuridica.nome);
        return naturezaJuridica;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<NaturezaJuridica> {
    const naturezaJuridica = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(naturezaJuridica)
      .then(async naturezaJuridica => {
        await this.assistente.cache.del(naturezaJuridica.id);
        await this.assistente.auditaExclusao(identificacao, naturezaJuridica, Modelo.NaturezaJuridica, 'Natureza Jurídica: ' + naturezaJuridica.nome);
        return naturezaJuridica;
      })
  }
}