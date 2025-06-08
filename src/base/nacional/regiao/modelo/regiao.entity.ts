import { Entity, Column } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUppercase, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('nacional.regiao')
export class Regiao extends Base {
  @IsOptional()
  @IsString() @Length(1)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @IsString() @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @IsString() @Length(1, 2) @IsUppercase() @IsAlpha()
  @Column('varchar')
  sigla: string;

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
  situacao: RegiaoSituacao;

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
}

export enum RegiaoSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('nacional.regiao')
export class Regiao_ extends BaseTabela_ {
  @Column()
  imagem: string;
}