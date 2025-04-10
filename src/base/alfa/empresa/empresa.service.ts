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
    const empresas = await this.leituraRepository.find(options);
    if (contagem) {
      const ids = empresas.map(empresa => empresa.id);
      const parametros = ids.map((_, index) => `$${index + 1}`).join(',');
      const consulta: string[] = [];
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "empresaId",`);
      consulta.push(`  id,`);
      consulta.push(`  codigo,`);
      consulta.push(`  nome,`);
      consulta.push(`  situacao`);
      consulta.push(`FROM alfa.estabelecimento`);
      consulta.push(`WHERE`);
      consulta.push(`  ("empresaId" IN (${parametros}))`);
      consulta.push(`  AND (remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "empresaId",`);
      consulta.push(`  nome;`);
      const estabelecimentos:
        { empresaId: string, id: string, codigo: string, nome: string, situacao: number, imagens: string[] }[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "empresaId",`);
      consulta.push(`  id,`);
      consulta.push(`  codigo,`);
      consulta.push(`  nome,`);
      consulta.push(`  situacao`);
      consulta.push(`FROM`);
      consulta.push(`  seguranca.perfil`);
      consulta.push(`WHERE`);
      consulta.push(`  ("empresaId" IN (${parametros}))`);
      consulta.push(`  AND (remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "empresaId",`);
      consulta.push(`  nome;`);
      const perfis:
        { empresaId: string, id: string, codigo: string, nome: string, situacao: number, imagens: string[] }[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      consulta.length = 0;
      consulta.push(`SELECT`);
      consulta.push(`  "usuarioEmpresa"."empresaId",`);
      consulta.push(`  usuario.id,`);
      consulta.push(`  usuario.codigo,`);
      consulta.push(`  usuario.nome,`);
      consulta.push(`  usuario.imagem,`);
      consulta.push(`  usuario.situacao,`);
      consulta.push(`  "usuarioEmpresa"."estabelecimentoIds",`);
      consulta.push(`  "usuarioEmpresa"."perfilIds"`);
      consulta.push(`FROM`);
      consulta.push(`  alfa."usuarioEmpresa"`);
      consulta.push(`  JOIN alfa.usuario ON (usuario.id = "usuarioEmpresa"."usuarioId")`);
      consulta.push(`WHERE`);
      consulta.push(`  ("usuarioEmpresa"."empresaId" IN (${parametros}))`);
      consulta.push(`  AND ("usuarioEmpresa".remocao IS NULL)`);
      consulta.push(`  AND (usuario.remocao IS NULL)`);
      consulta.push(`ORDER BY`);
      consulta.push(`  "usuarioEmpresa"."empresaId",`);
      consulta.push(`  usuario.nome;`);
      const usuarios:
        { empresaId: string, id: string, codigo: string, nome: string, imagem: string, situacao: number, estabelecimentoIds: string[], perfilIds: string[]}[]
        = await this.assistente.leitura.query(consulta.join('\n'), ids);
      for (const estabelecimento of estabelecimentos) {
        estabelecimento.imagens = [];
        usuarios.forEach(usuario => {
          if (usuario.empresaId !== estabelecimento.empresaId) {
            return;
          }
          if (
            (!usuario.estabelecimentoIds?.length || usuario.estabelecimentoIds.includes(estabelecimento.id))
            && !estabelecimento.imagens.includes(usuario.imagem)
          ) {
            estabelecimento.imagens.push(usuario.imagem);
          }
        });
      }
      for (const perfil of perfis) {
        perfil.imagens = [];
        usuarios.forEach(usuario => {
          if (usuario.empresaId !== perfil.empresaId) {
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
      for (const empresa of empresas) {
        empresa['estabelecimentos'] = estabelecimentos
          .filter(estabelecimento => estabelecimento.empresaId === empresa.id)
          .map(estabelecimento => {
            delete estabelecimento.empresaId;
            return estabelecimento;
          });
        empresa['perfis'] = perfis
          .filter(perfil => perfil.empresaId === empresa.id)
          .map(perfil => {
            delete perfil.empresaId;
            return perfil;
          });
        empresa['usuarios'] = usuarios
          .filter(usuario => usuario.empresaId === empresa.id)
          .map(usuario => {
            delete usuario.empresaId;
            return usuario;
          });
      }
    }
    return this.assistente.pagina(criterios, contagem, empresas);
  }

  async sincroniza(identificacao: Identificacao, criterios: any): Promise<Pagina<Empresa>> {
    this.assistente.adapta(criterios, { sincronizacao: true });
    const options: FindManyOptions<Empresa> = {
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

  async lista(identificacao: Identificacao, criterios: any): Promise<Empresa[]> {
    this.assistente.adapta(criterios);
    const options: FindManyOptions<Empresa> = {
      select: { id: true, nome: true, imagem: true, situacao: true },
      order: { situacao: 1, super: -1, nome: 1 },
      loadEagerRelations: false,
    };
    if (criterios.atuante) {
      options.where = [{ atuante: true }];
    }
    return this.leituraRepository.find(options);
  }

  async busca(identificacao: Identificacao, criterios: any): Promise<Empresa[]> {
    const options: FindManyOptions<Empresa> = {
      order: { situacao: 1, nome: 1 },
    };
    options.where = [];
    if (criterios.super === '1') {
      options.where.push({ super: true });
    }
    return this.leituraRepository.find(options);
  }

  async capta(identificacao: Identificacao, id: string): Promise<Empresa> {
    const empresa = await this.assistente.cache.get<Empresa>(id);
    if (empresa) {
      return empresa;
    }
    return this.gravacaoRepository.findOneOrFail({
      where: { id },
      loadEagerRelations: true,
    }).then(empresa => {
      this.assistente.cache.set(empresa.id, empresa);
      return empresa;
    });
  }
  async salva(identificacao: Identificacao, empresa: Empresa): Promise<Empresa> {
    empresa.atuante = empresa.situacao === EmpresaSituacao.Ativa;
    await this.assistente.unico(this.gravacaoRepository, { empresa }, {
      codigo: 'código', nome: 'nome',
    });
    if (!empresa.codigo) {
      await this.assistente.sequencia(this.gravacaoRepository, empresa, '', 7);
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
      })
  }
}