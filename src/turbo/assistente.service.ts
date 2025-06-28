import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DateTime } from 'luxon';

import { Identificacao } from 'src/autenticacao/identificacao';
import { Base, Modelo, Procedimento } from 'src/base/base';

export class Pagina<T> {
  numero: number;
  paginas: number;
  total: number;
  linhas: T[];
}

class BaseOrganizacao {
  organizacao: { id: string };
}

@Injectable()
export class AssistenteService {
  private readonly _principal = (process.env.principal === '1');
  private readonly _guidZero = '00000000-0000-0000-0000-000000000000';

  public readonly dataMinima = new Date('2021-01-01');
  public readonly dataMaxima = new Date('9999-12-31');

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    @InjectDataSource('gravacao')
    private readonly gravacaoDataSource: DataSource,
    @InjectDataSource('leitura')
    private readonly leituraDataSource: DataSource,
  ) { }

  get gravacao(): DataSource {
    return this.gravacaoDataSource;
  }

  get leitura(): DataSource {
    return this.leituraDataSource;
  }

  get principal(): boolean {
    return this._principal;
  }

  get guidZero(): string {
    return this._guidZero;
  }

  get cache(): Cache {
    return this.cacheService;
  }

  adapta(identificacao: Identificacao, criterios: any, opcoes: { sincronizacao?: boolean; utc?: boolean } = { sincronizacao: false, utc: false }): any {
    criterios ??= {};
    criterios.pagina = +criterios.pagina || 1;
    criterios.linhas = +criterios.linhas || 100;
    criterios.salto = (criterios.pagina - 1) * criterios.linhas;
    if (opcoes.sincronizacao) {
      criterios.momento = new Date(criterios.momento || '2021-01-01');
    }
    const busca = criterios.busca;
    if ((typeof (busca) === 'string') && (busca !== 'null')) {
      if (busca.startsWith('#')) {
        criterios.legenda = '%' + busca.substring(1).toLowerCase() + '%';
      } else if (!busca.includes('.') && +busca) {
        criterios.codigo = busca.toLowerCase().replaceAll('*', '%');
        criterios.numero = +busca;
      } else if (busca.includes('@')) {
        criterios.email = busca;
      } else if (busca) {
        criterios.nome = busca.toLowerCase().replaceAll('*', '%') + '%';
      }
    }
    const selecao = criterios.selecao;
    if ((typeof (selecao) === 'string') && ['ativo', 'inerte', 'destaque', 'recente'].includes(selecao)) {
      criterios[selecao] = true;
    }
    if (+criterios.atuante === 1) {
      criterios.situacao = 1;
    }
    if (criterios.intervalo) {
      this.intervalo(identificacao, criterios, opcoes.utc);
    }
  }

  intervalo(identificacao: Identificacao, criterios: any, utc: boolean): void {
    if (!criterios.intervalo) {
      return;
    }
    var agora: DateTime;
    if (utc) {
      agora = DateTime.now().toUTC();
    } else {
      agora = DateTime.now();
    }
    var inicio: DateTime;
    var conclusao: DateTime;
    switch (criterios.intervalo) {
      case 'ontem':
        inicio = agora.minus({ days: 1 });
        conclusao = agora.minus({ days: 1 });
        break;
      case 'hoje':
        inicio = agora;
        conclusao = agora;
        break;
      case '-semana':
        inicio = agora.minus({ days: 15 });
        conclusao = agora.minus({ days: 8 });
        break;
      case 'semana':
        inicio = agora.minus({ days: 7 });
        conclusao = agora;
        break;
      case '-mes':
        inicio = agora.startOf('month').minus({ months: 1 });
        conclusao = agora.minus({ months: 1 });
        break;
      case 'mes':
        inicio = agora.startOf('month');
        conclusao = agora;
        break;
      case '-ano':
        inicio = agora.startOf('year').minus({ months: 12 });
        conclusao = agora.minus({ months: 12 });
        break;
      case 'ano':
        inicio = agora.startOf('year');
        conclusao = agora;
        break;
      default:
        inicio = DateTime.fromISO('2025-01-01').setZone('America/Sao_Paulo');
        conclusao = DateTime.fromISO('9999-12-31').setZone('America/Sao_Paulo');
    }
    criterios.inicio = inicio.toISODate();
    criterios.conclusao = conclusao.toISODate();
  }

  pagina<T>(criterios: any, total: number, linhas: T[]): Pagina<T> {
    return {
      numero: +criterios.pagina,
      paginas: Math.ceil(total / (+criterios.linhas || 1)),
      total,
      linhas,
    };
  }

  async unico<T>(repository: Repository<T>, referencia: Record<string, object>, propriedades: Record<string, string>, identificador: Record<string, string> = {}): Promise<void> {
    if ((Object.keys(referencia).length) !== 1) {
      this.parametroInvalido('referencia');
    }
    var esquema = '';
    var tabela = '';
    var instancia: object = null;
    const segmentos = repository.metadata.tableName.split('.');
    if (segmentos.length === 2) {
      esquema = segmentos[0];
    }
    for (const chave in referencia) {
      tabela = chave;
      instancia = referencia[chave];
    }
    if (!Object.keys(identificador).length) {
      identificador = { id: instancia['id'] };
    }
    for (const chave in propriedades) {
      if (!propriedades.hasOwnProperty(chave)) {
        continue;
      }
      const campo = propriedades[chave];
      if ((chave === 'numero') && (+referencia < 0)) {
        continue;
      }
      if ((chave === 'codigo') && !instancia['codigo']) {
        return;
      }
      var valor = instancia[chave];
      const consulta: string[] = [];
      consulta.push(`SELECT COUNT(*) quantidade`);
      consulta.push(`FROM "${esquema}"."${tabela}"`);
      consulta.push(`WHERE`);
      if (typeof (valor) === 'string') {
        consulta.push(`  (versal(${chave}) = versal('${valor}'))`);
      } else {
        consulta.push(`  ("${chave}" = ${valor})`);
      }
      for (const chave in identificador) {
        consulta.push(`  AND ("${chave}" <> '${identificador[chave] || this._guidZero}')`);
      }
      consulta.push(`  AND (remocao IS NULL);`);
      const [{ quantidade }] = await repository.query(consulta.join('\n'));
      if (+quantidade) {
        this.conflito(`já existe um registro com o campo ${campo} = ${valor}`);
      }
    }
    return;
  }

  async unicoOrganizacao<T>(repository: Repository<T>, organizacao: { id: string }, referencia: Record<string, object>, propriedades: Record<string, string>, identificador: Record<string, string> = {}): Promise<void> {
    if ((Object.keys(referencia).length) !== 1) {
      this.parametroInvalido('referencia');
    }
    var esquema = '';
    var tabela = '';
    var instancia: object = null;
    const segmentos = repository.metadata.tableName.split('.');
    if (segmentos.length === 2) {
      esquema = segmentos[0];
    }
    for (const chave in referencia) {
      tabela = chave;
      instancia = referencia[chave];
    }
    if (!Object.keys(identificador).length) {
      identificador = { id: instancia['id'] };
    }
    for (const chave in propriedades) {
      if (!propriedades.hasOwnProperty(chave)) {
        continue;
      }
      const campo = propriedades[chave];
      if ((chave === 'numero') && (+referencia < 0)) {
        continue;
      }
      if ((chave === 'codigo') && !instancia['codigo']) {
        return;
      }
      var valor = instancia[chave];
      const consulta: string[] = [];
      consulta.push(`SELECT COUNT(*) quantidade`);
      consulta.push(`FROM "${esquema}"."${tabela}"`);
      consulta.push(`WHERE`);
      consulta.push(`  ("organizacaoId" = '${organizacao.id}')`);
      if (typeof (valor) === 'string') {
        consulta.push(`  AND (versal(${chave}) = versal('${valor}'))`);
      } else {
        consulta.push(`  AND ("${chave}" = ${valor})`);
      }
      for (const chave in identificador) {
        consulta.push(`  AND ("${chave}" <> '${identificador[chave] || this._guidZero}')`);
      }
      consulta.push(`  AND (remocao IS NULL);`);
      const [{ quantidade }] = await repository.query(consulta.join('\n'));
      if (+quantidade) {
        this.conflito(`já existe um registro com o campo ${campo} = ${valor}`);
      }
    }
    return;
  }

  consultaIds(tabela: string, campo: string, criterios: Record<string, string>): string {
    if (!Object.keys(criterios).length) {
      this.parametroInvalido('criterios');
    }
    const consulta: string[] = [];
    consulta.push(`SELECT "${campo}"`);
    consulta.push(`FROM "${tabela.split('.').join('"."')}"`);
    consulta.push(`WHERE`);
    var conectivo = '';
    for (const chave in criterios) {
      if (!criterios.hasOwnProperty(chave)) {
        continue;
      }
      var valor = criterios[chave];
      if (typeof (valor) === 'string') {
        valor = `'${valor}'`;
      }
      consulta.push(`  ${conectivo}("${chave}" = ${valor})`);
    }
    consulta.push(`  AND ("remocao" IS NULL)`);
    return consulta.join(' ');
  }

  async audita<T extends Base>(identificacao: Identificacao, instancia: T, modelo: Modelo, referencia: number | boolean, descricao: string): Promise<void> {
    referencia ??= null;
    var procedimento = Procedimento.Adicao;
    if (!referencia) {
      procedimento = Procedimento.Adicao;
    }
    if (typeof (referencia) === 'boolean') {
      procedimento = referencia ? Procedimento.Adicao : Procedimento.Edicao;
    }
    if (typeof (referencia) === 'number') {
      procedimento = referencia;
    }
    const consulta: string[] = [];
    consulta.push(`INSERT INTO seguranca.auditoria`);
    consulta.push(`  (id, adicao, edicao, versao, "usuarioId", "autorizacaoId", horario, instante, procedimento, instancia, "instanciaId", "instanciaModelo", "instanciaDescricao")`);
    consulta.push(`VALUES`);
    consulta.push(`  (default, default, default, 1, '${identificacao.usuario.id}', '${identificacao.id}', '${identificacao.horario || 'UTC+0'}', now(), ${procedimento}, '${JSON.stringify(instancia)}', '${instancia.id}', '${modelo}', '${descricao}');`);
    await this.gravacao.query(consulta.join('\n'));
  }

  async sequencia<T extends Base>(repository: Repository<T>, instancia: T, prefixo: string, digitos: number): Promise<void> {
    if (instancia.id) {
      return;
    }
    const [{ sequencia }] = await this.gravacao.query(`SELECT sistema.sequencia_nova('${repository.metadata.tableName}', '${prefixo}', ${digitos}, 1) AS sequencia;`);
    instancia['codigo'] = sequencia;
  }

  async sequenciaOrganizacao<T extends Base>(repository: Repository<T>, instancia: T, organizacao: { id: string }, prefixo: string, digitos: number): Promise<void> {
    if (instancia.id) {
      return;
    }
    const [{ sequencia }] = await this.gravacao.query(`SELECT sistema."sequenciaOrganizacao_nova"('${repository.metadata.tableName}', '${organizacao.id}'::uuid , '${prefixo}', ${digitos}, 1) AS sequencia;`);
    instancia['codigo'] = sequencia;
  }

  async auditaExclusao<T extends Base>(identificacao: Identificacao, instancia: T, modelo: Modelo, descricao: string): Promise<void> {
    await this.audita<T>(identificacao, instancia, modelo, Procedimento.Remocao, descricao);
  }

  autoriza(identificacao: Identificacao, referencia: BaseOrganizacao | BaseOrganizacao[]): void {
    if (!(referencia instanceof Array)) {
      if (!referencia.organizacao) {
        referencia.organizacao = identificacao.organizacao;
      } else if (identificacao.organizacao.id !== referencia.organizacao.id) {
        this.incoerencia('as informações da organizacao divergem da identificação');
      }
      return;
    }
    for (const item of referencia) {
      this.autoriza(identificacao, item);
    }
  }

  sid(prefixo: string) {
    return (
      prefixo
      + Date.now().toString(36)
      + Math.random().toString(36).substring(2, 6)
    ).substring(0, 20);
  }

  conflito(mensagem: string): void {
    throw new ConflictException(mensagem);
  }

  incoerencia(mensagem: string): void {
    throw new BadRequestException(mensagem);
  }

  vetado(mensagem: string): void {
    throw new UnauthorizedException(mensagem);
  }

  parametroAusente(parametro: string): void {
    throw new InternalServerErrorException(`Parâmetro '${parametro}' ausente`);
  }

  parametroInvalido(parametro: string): void {
    throw new InternalServerErrorException(`Parâmetro '${parametro}' inválido`);
  }
}