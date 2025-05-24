import { Entity, Column } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUppercase, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('global.ddi')
export class Ddi extends Base {
  @IsOptional()
  @IsString() @Length(3)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @IsString() @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsOptional()
  @IsString() @Length(2, 800)
  @Column('varchar')
  descricao: string;

  @IsOptional()
  @IsUrl() @Length(1, 800)
  @Column('varchar')
  imagem: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: DdiSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { array: true })
  etiquetas: string[];

  @IsOptional()
  @IsString() @Length(1, 4000)
  @Column('varchar')
  observacoes: string;

  @IsNotEmpty()
  @IsAlpha() @Length(2) @IsUppercase()
  @Column('varchar')
  iso2: string;

}

export enum DdiSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

@Entity('global.ddi')
export class Ddi_ extends BaseTabela_ { }