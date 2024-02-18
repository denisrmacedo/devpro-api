import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class Pagina<T> {
  numero: number;
  paginas: number;
  linhas: T[];
}

@Injectable()
export class AssistenteService {
  private _principal = (process.env.PRINCIPAL === '1');
  private readonly _guidZero = '00000000-0000-0000-0000-000000000000';

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  get principal(): boolean {
    return this.principal;
  }

  get guidZero(): string {
    return this._guidZero;
  }

  get cache(): Cache {
    return this.cacheService;
  }

  adapta(criterios: any, opcoes: { sincronizacao: boolean } = { sincronizacao: false }) {
    criterios ??= {};
    criterios.pagina = +criterios.pagina || 1;
    criterios.linhas = +criterios.linhas || 100;
    criterios.salto = (criterios.pagina - 1) * criterios.linhas;
    if (opcoes.sincronizacao) {
      criterios.momento = new Date(criterios.momento || '2021-01-01');
    }
    const busca = criterios.busca;
    if (typeof (busca) === 'string') {
      if (busca.startsWith('#')) {
        criterios.legenda = '%' + busca.substring(1).toLowerCase() + '%';
      } else if (!busca.includes('.') && +busca) {
        criterios.codigo = busca.toLowerCase().replaceAll('*', '%');
        criterios.numero = +busca;
      } else if (busca.includes('@')) {
        criterios.email = busca;
      } else
        criterios.nome = busca.toLowerCase().replaceAll('*', '%') + '%';
    }
    const selecao = criterios.selecao;
    if ((typeof (selecao) === 'string') && ['ativo', 'inerte', 'destaque', 'recente'].includes(selecao)) {
      criterios[selecao] = true;
    }
  }
  pagina<T>(criterios: any, contagem: number, linhas: T[]): Pagina<T> {
    return {
      numero: +criterios.pagina,
      paginas: Math.ceil(contagem / (+criterios.linhas || 1)),
      linhas,
    };
  }

  async unico<T>(repository: Repository<T>, referencia: Record<string, object>, propriedades: Record<string, string>): Promise<void> {
    if ((Object.keys(referencia).length) !== 1)
      this.parametroInvalido('referencia');
    var tabela: string;
    var instancia: object;
    for (const chave in referencia) {
      tabela = chave;
      instancia = referencia[chave];
    }
    for (const chave in propriedades) {
      if (!propriedades.hasOwnProperty(chave))
        continue;
      const campo = propriedades[chave];
      if ((chave === 'numero') && (+referencia < 0))
        continue;
      var valor = instancia[chave];
      const id = instancia['id'] ?? this._guidZero;
      const consulta: string[] = [];
      consulta.push(`SELECT count(*) "quantidade"`);
      consulta.push(`FROM "${tabela.split('.').join('"."')}"`);
      consulta.push(`WHERE`);
      if (typeof(valor) === 'string')
        consulta.push(`  (versal("${chave}") = versal('${valor}'))`);
      else
        consulta.push(`  ("${chave}" = ${valor})`);
      consulta.push(`  AND ("id" <> '${id}')`);
      consulta.push(`  AND ("remocao" IS NULL);`);
      const [{ quantidade }] = await repository.query(consulta.join('\n'));
      if (+quantidade)
        this.conflito(`já existe um registro com o campo ${campo} = ${valor}`);
    }
    return;
  }

  consultaIds(tabela: string, campo: string, criterios: Record<string, string>): string {
    if (!Object.keys(criterios).length)
      this.parametroInvalido('criterios');
    const consulta: string[] = [];
    consulta.push(`SELECT "${campo}"`);
    consulta.push(`FROM "${tabela.split('.').join('"."')}"`);
    consulta.push(`WHERE`);
    var conectivo = '';
    for (const chave in criterios) {
      if (!criterios.hasOwnProperty(chave))
        continue;
      var valor = criterios[chave];
      if (typeof(valor) === 'string')
        valor = `'${valor}'`;
      consulta.push(`  ${conectivo}("${chave}" = ${valor})`);
    }
    consulta.push(`  AND ("remocao" IS NULL)`);
    return consulta.join(' ');
  }

  audita(): void {

  }

  conflito(mensagem: string): void {
    throw new ConflictException(mensagem);
  }

  incoerencia(mensagem: string): void {
    throw new BadRequestException(mensagem);
  }

  parametroAusente(parametro: string): void {
    throw new InternalServerErrorException(`Parâmetro '${parametro}' ausente`);
  }

  parametroInvalido(parametro: string): void {
    throw new InternalServerErrorException(`Parâmetro '${parametro}' inválido`);
  }
}