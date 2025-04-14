import { Entity, Column } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('governo.grupoTributario')
export class GrupoTributario extends Base {
  @IsOptional()
  @IsString() @Length(1, 40)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 200)
  @Column('varchar')
  nome: string;

  @IsOptional()
  @Length(2, 200)
  @Column('varchar')
  descricao: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: GrupoTributarioSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { array: true })
  etiquetas: string[];
}

export enum GrupoTributarioSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('governo.GrupoTributario')
export class GrupoTributario_ extends BaseTabela_ { }