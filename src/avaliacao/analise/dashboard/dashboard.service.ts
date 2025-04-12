import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindManyOptions, Raw } from 'typeorm';

import { Identificacao } from 'src/autenticacao/identificacao';
import { AssistenteService, Pagina } from 'src/turbo/assistente.service';
import { Modelo } from 'src/base/base';

@Injectable()
export class DashboardService {
  constructor(
    private readonly assistente: AssistenteService,
  ) { }

  async resumo(identificacao: Identificacao, criterios: any): Promise<any> {
    criterios ??= {};
    criterios.intervalo ??= 'todos';
    this.assistente.adapta(criterios);
    const consulta: string[] = [];
    consulta.push(`WITH`);
    consulta.push(`usuario AS (`);
    consulta.push(`  SELECT COUNT(*) "quantidade"`);
    consulta.push(`  FROM administrativo.usuario`);
    consulta.push(`  WHERE`);
    consulta.push(`    (adicao BETWEEN '${criterios.inicio}' AND '${criterios.conclusao}T23:59:59.910Z')`);
    consulta.push(`    AND (remocao IS NULL)`);
    consulta.push(`),`);
    consulta.push(`autorizacao AS (`);
    consulta.push(`  SELECT COUNT(*) "quantidade"`);
    consulta.push(`  FROM seguranca.autorizacao`);
    consulta.push(`  WHERE`);
    consulta.push(`    (inicio BETWEEN '${criterios.inicio}' AND '${criterios.conclusao}T23:59:59.910Z')`);
    consulta.push(`    AND (remocao IS NULL)`);
    consulta.push(`)`);
    consulta.push(`SELECT`);
    consulta.push(`  usuario.quantidade usuarios,`);
    consulta.push(`  autorizacao.quantidade autorizacoes`);
    consulta.push(`FROM`);
    consulta.push(`  usuario, autorizacao`);
    return this.assistente.leitura.query(consulta.join('\n')).then(resultados => resultados[0]);
  }
}