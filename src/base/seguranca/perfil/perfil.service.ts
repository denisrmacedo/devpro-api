import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw, FindOptionsSelect } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Perfil, PerfilSituacao } from './modelo/perfil.entity';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Perfil, 'gravacao')
    private readonly gravacaoRepository: Repository<Perfil>,
    @InjectRepository(Perfil, 'leitura')
    private readonly leituraRepository: Repository<Perfil>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Perfil>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Perfil> = {
      order: { situacao: 1, nome: 1 },
      loadEagerRelations: false,
      skip: criterios.salto,
      take: criterios.linhas,
    };
    if (criterios.recente) {
      options.order = { edicao: 1 };
    }
    options.where = [{ organizacao: { id: identificacao.organizacao.id }}];
    if (criterios.situacao) {
      options.where.push({ situacao: criterios.situacao });
    }
    if (criterios.codigo) {
      options.where.push({ codigo: Raw((alias) => `versal(${alias}) LIKE versal(:codigo)`, { codigo: criterios.codigo }) });
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

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Perfil>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Perfil> = {
      skip: criterios.salto,
      take: criterios.linhas,
    };
    options.where = [{ organizacao: { id: identificacao.organizacao.id }}];
    options.where.push({ edicao: MoreThan(criterios.momento) });
    const contagem = await this.gravacaoRepository.count(options);
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async lista(identificacao: Identificacao, criterios: any): Promise<Perfil[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Perfil> = {
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

  async busca(identificacao: Identificacao, criterios: any): Promise<Perfil[]> {
    const options: FindManyOptions<Perfil> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [{ organizacao: { id: identificacao.organizacao.id }}];
    if (criterios.administrador === '1') {
      options.where.push({ administrador: true });
    }
    return this.leituraRepository.find(options).then(
      linhas => {
        this.assistente.autoriza(identificacao, linhas);
        return linhas;
      }
    );
  }

  async capta(identificacao: Identificacao, id: string): Promise<Perfil> {
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(perfil => {
      this.assistente.autoriza(identificacao, perfil);
      return perfil;
    });
  }
  async salva(identificacao: Identificacao, perfil: Perfil): Promise<Perfil> {
    perfil.atuante = perfil.situacao === PerfilSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { perfil }, {
      codigo: 'codigo', nome: 'nome',
    });
    if (!perfil.codigo) {
      await this.assistente.sequenciaOrganizacao(this.gravacaoRepository, perfil, perfil.organizacao, '', 3);
    }
    const novo = perfil.novo;
    return this.gravacaoRepository
      .save(perfil)
      .then(async perfil => {
        await this.assistente.audita(identificacao, perfil, Modelo.Perfil, novo, 'Perfil: ' + perfil.nome);
        return perfil;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Perfil> {
    const perfil = await this.capta(identificacao, id);
    this.assistente.autoriza(identificacao, perfil);
    return this.gravacaoRepository
      .softRemove(perfil)
      .then(async perfil => {
        await this.assistente.auditaExclusao(identificacao, perfil, Modelo.Perfil, 'Perfil: ' + perfil.nome);
        return perfil;
      })
  }
}