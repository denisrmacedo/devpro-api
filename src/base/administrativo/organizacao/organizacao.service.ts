import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';
import { Organizacao, OrganizacaoSituacao } from './modelo/organizacao.entity';

@Injectable()
export class OrganizacaoService {
  constructor(
    @InjectRepository(Organizacao, 'gravacao')
    private readonly gravacaoRepository: Repository<Organizacao>,
    @InjectRepository(Organizacao, 'leitura')
    private readonly leituraRepository: Repository<Organizacao>,
    private readonly assistente: AssistenteService,
  ) { }

  async indice(identificacao: Identificacao, criterios: any): Promise<Pagina<Organizacao>> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Organizacao> = {
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
    const organizacoes = await this.leituraRepository.find(options);
    if (contagem) {
      const ids = organizacoes.map(organizacao => organizacao.id);
      const parametros = ids.map((_, index) => `$${index + 1}`).join(',');
      const consulta: string[] = [];
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  id,`);
      consulta.push(`  codigo,`);
      consulta.push(`  nome,`);
      consulta.push(`  situacao`);
      consulta.push(`FROM administrativo.empresa`);
      consulta.push(`WHERE`);
      consulta.push(`  ("organizacaoId" IN (${parametros}))`);
      consulta.push(`  AND (remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  situacao,`);
      consulta.push(`  nome;`);
      const empresas:
        { organizacaoId: string, id: string, codigo: string, nome: string, situacao: number }[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  id,`);
      consulta.push(`  codigo,`);
      consulta.push(`  nome,`);
      consulta.push(`  situacao`);
      consulta.push(`FROM administrativo.filial`);
      consulta.push(`WHERE`);
      consulta.push(`  ("organizacaoId" IN (${parametros}))`);
      consulta.push(`  AND (remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  situacao,`);
      consulta.push(`  super DESC,`);
      consulta.push(`  nome;`);
      const filiais:
        { organizacaoId: string, id: string, codigo: string, nome: string, situacao: number, imagens: string[] }[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  id,`);
      consulta.push(`  codigo,`);
      consulta.push(`  nome,`);
      consulta.push(`  situacao`);
      consulta.push(`FROM`);
      consulta.push(`  seguranca.perfil`);
      consulta.push(`WHERE`);
      consulta.push(`  ("organizacaoId" IN (${parametros}))`);
      consulta.push(`  AND (remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "organizacaoId",`);
      consulta.push(`  situacao,`);
      consulta.push(`  administrador DESC,`);
      consulta.push(`  nome;`);
      const perfis:
        { organizacaoId: string, id: string, codigo: string, nome: string, situacao: number, imagens: string[] }[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "usuarioOrganizacao"."organizacaoId",`);
      consulta.push(`  usuario.id,`);
      consulta.push(`  usuario.codigo,`);
      consulta.push(`  usuario.nome,`);
      consulta.push(`  usuario.imagem,`);
      consulta.push(`  usuario.situacao,`);
      consulta.push(`  "usuarioOrganizacao"."filialIds",`);
      consulta.push(`  "usuarioOrganizacao"."perfilIds"`);
      consulta.push(`FROM`);
      consulta.push(`  administrativo."usuarioOrganizacao"`);
      consulta.push(`  JOIN administrativo.usuario ON (usuario.id = "usuarioOrganizacao"."usuarioId")`);
      consulta.push(`WHERE`);
      consulta.push(`  ("usuarioOrganizacao"."organizacaoId" IN (${parametros}))`);
      consulta.push(`  AND ("usuarioOrganizacao".remocao IS NULL)`);
      consulta.push(`  AND (usuario.remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "usuarioOrganizacao"."organizacaoId",`);
      consulta.push(`  usuario.situacao,`);
      consulta.push(`  usuario.nome;`);
      const usuarios:
        { organizacaoId: string, id: string, codigo: string, nome: string, imagem: string, situacao: number, filialIds: string[], perfilIds: string[]}[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      for (const filial of filiais) {
        filial.imagens = [];
        usuarios.forEach(usuario => {
          if (usuario.organizacaoId !== filial.organizacaoId) {
            return;
          }
          if (
            (!usuario.filialIds?.length || usuario.filialIds.includes(filial.id))
            && !filial.imagens.includes(usuario.imagem)
          ) {
            filial.imagens.push(usuario.imagem);
          }
        });
      }
      for (const perfil of perfis) {
        perfil.imagens = [];
        usuarios.forEach(usuario => {
          if (usuario.organizacaoId !== perfil.organizacaoId) {
            return;
          }
          if (
            (!usuario.perfilIds?.length || usuario.perfilIds.includes(perfil.id))
            && !perfil.imagens.includes(usuario.imagem)
          ) {
            perfil.imagens.push(usuario.imagem);
          }
        });
      }
      for (const organizacao of organizacoes) {
        organizacao['empresas'] = empresas
          .filter(empresa => empresa.organizacaoId === organizacao.id)
          .map(empresa => {
            delete empresa.organizacaoId;
            return empresa;
          });
        organizacao['filiais'] = filiais
          .filter(filial => filial.organizacaoId === organizacao.id)
          .map(filial => {
            delete filial.organizacaoId;
            return filial;
          });
        organizacao['perfis'] = perfis
          .filter(perfil => perfil.organizacaoId === organizacao.id)
          .map(perfil => {
            delete perfil.organizacaoId;
            return perfil;
          });
        organizacao['usuarios'] = usuarios
          .filter(usuario => usuario.organizacaoId === organizacao.id)
          .map(usuario => {
            delete usuario.organizacaoId;
            return usuario;
          });
      }
    }
    return this.assistente.pagina(criterios, contagem, organizacoes);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Organizacao>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Organizacao> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Organizacao[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Organizacao> = {
      select: { id: true, nome: true, imagem: true, situacao: true },
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Organizacao[]> {
    const options: FindManyOptions<Organizacao> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.super === '1') {
      options.where.push({ super: true });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Organizacao> {
    const organizacao = await this.assistente.cache.get<Organizacao>(id);
    if (organizacao) {
      return organizacao;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(organizacao => {
      this.assistente.cache.set(organizacao.id, organizacao);
      return organizacao;
    });
  }
  async salva(identificacao: Identificacao, organizacao: Organizacao): Promise<Organizacao> {
    organizacao.atuante = organizacao.situacao === OrganizacaoSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { organizacao }, {
      codigo: 'código', nome: 'nome',
    });
    if (!organizacao.codigo) {
      await this.assistente.sequencia(this.gravacaoRepository, organizacao, '', 7);
    }
    const novo = organizacao.novo;
    return this.gravacaoRepository
      .save(organizacao)
      .then(async organizacao => {
        await this.assistente.cache.set(organizacao.id, organizacao);
        await this.assistente.audita(identificacao, organizacao, Modelo.Organizacao, novo, 'Organizacao: ' + organizacao.nome);
        return organizacao;
      });
  }

  async remove(identificacao: Identificacao, id: string): Promise<Organizacao> {
    const organizacao = await this.capta(identificacao, id);
    return await this.gravacaoRepository
      .softRemove(organizacao)
      .then(async organizacao => {
        await this.assistente.cache.del(organizacao.id);
        await this.assistente.auditaExclusao(identificacao, organizacao, Modelo.Organizacao, 'Organizacao: ' + organizacao.nome);
        return organizacao;
      })
  }
}