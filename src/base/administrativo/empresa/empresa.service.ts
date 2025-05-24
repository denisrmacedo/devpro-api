import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Empresa, EmpresaSituacao } from './modelo/empresa.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa, 'gravacao')
    private readonly gravacaoRepository: Repository<Empresa>,
    @InjectRepository(Empresa, 'leitura')
    private readonly leituraRepository: Repository<Empresa>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Empresa>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Empresa> = {
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = [{ organizacao: { id: identificacao.organizacao.id } }];
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

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Empresa>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Empresa> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Empresa[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Empresa> = {
      select: { id: true, nome: true, situacao: true },
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
    };
    criterios.organizacaoId ??= identificacao.organizacao.id;
    options.where = [{ organizacao: { id: criterios.organizacaoId }}];
    if (criterios.atuante) {
      options.where.push({ atuante: true });
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Empresa[]> {
    const options: FindManyOptions<Empresa> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Empresa> {
    // const empresa = await this.assistente.cache.get<Empresa>(id);
    // if (empresa) {
    //   return empresa;
    // }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(empresa => {
      this.assistente.cache.set(empresa.id, empresa);
      return empresa;
    });
  }
  async salva(identificacao: Identificacao, empresa: Empresa): Promise<Empresa> {
    empresa.atuante = empresa.situacao === EmpresaSituacao.Ativo;
    await this.assistente.unicoOrganizacao(this.gravacaoRepository, identificacao.organizacao, { empresa }, {
      codigo: 'código', nome: 'nome',
    });
    if (!empresa.codigo) {
      await this.assistente.sequenciaOrganizacao(this.gravacaoRepository, empresa, empresa.organizacao, '', 3);
    }
    const novo = empresa.novo;
    return this.gravacaoRepository
      .save(empresa)
      .then(async empresa => {
        await this.assistente.cache.set(empresa.id, empresa);
        await this.assistente.audita(identificacao, empresa, Modelo.Empresa, novo, 'Empresa: ' + empresa.nome);
        return empresa;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Empresa> {
    const empresa = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(empresa)
      .then(async empresa => {
        await this.assistente.cache.del(empresa.id);
        await this.assistente.auditaExclusao(identificacao, empresa, Modelo.Empresa, 'Empresa: ' + empresa.nome);
        return empresa;
      });
  }
}