import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Servidor, ServidorSituacao } from './modelo/servidor.entity';

@Injectable()
export class ServidorService {
  constructor(
    @InjectRepository(Servidor, 'gravacao')
    private readonly gravacaoRepository: Repository<Servidor>,
    @InjectRepository(Servidor, 'leitura')
    private readonly leituraRepository: Repository<Servidor>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Servidor>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Servidor> = {
      order: { situacao: 1, super: -1, nome: 1 },
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
    return this.leituraRepository.find(options)
      .then(
        linhas => this.assistente.pagina(criterios, contagem, linhas),
      );
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Servidor>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Servidor> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Servidor[]> {
    const options: FindManyOptions<Servidor> = {
      select: { id: true, nome: true, imagem: true, situacao: true },
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
    };
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Servidor[]> {
    const options: FindManyOptions<Servidor> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.super === '1') {
      options.where.push({ super: true });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Servidor> {
    const servidor = await this.assistente.cache.get<Servidor>(id);
    if (servidor) {
      return servidor;
    }
    return this.gravacaoRepository.findOneByOrFail({ id })
      .then(servidor => {
        this.assistente.cache.set(servidor.id, servidor);
        return servidor;
      });
  }
  async salva(identificacao: Identificacao, servidor: Servidor): Promise<Servidor> {
    servidor.atuante = servidor.situacao === ServidorSituacao.Ativo;
    await this.assistente.unico(this.gravacaoRepository, { servidor }, {
      codigo: 'código', nome: 'nome',
    });
    if (!servidor.codigo) {
      await this.assistente.sequencia(this.gravacaoRepository, servidor, '', 3);
    }
    const novo = servidor.novo;
    return this.gravacaoRepository
      .save(servidor)
      .then(async servidor => {
        await this.assistente.cache.set(servidor.id, servidor);
        await this.assistente.audita(identificacao, servidor, Modelo.Servidor, novo, 'Servidor: ' + servidor.nome);
        return servidor;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Servidor> {
    const servidor = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(servidor)
      .then(async servidor => {
        await this.assistente.cache.del(servidor.id);
        await this.assistente.auditaExclusao(identificacao, servidor, Modelo.Servidor, 'Servidor: ' + servidor.nome);
        return servidor;
      })
  }
}