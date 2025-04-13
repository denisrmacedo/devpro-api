import { Entity, Column } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('governo.naturezaJuridica')
export class NaturezaJuridica extends Base {
  @IsOptional()
  @IsString() @Length(1, 40)
  @Column('varchar')
  codigo: string;

  @IsOptional()
  @IsString() @Length(1, 40)
  @Column('varchar')
  nivel: string;

  @IsNotEmpty()
  @IsNumberString() @Length(1, 1)
  @Column('varchar')
  secao: string;

  @IsOptional()
  @IsString() @Length(1, 10)
  @Column('varchar')
  classe: string;

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
  situacao: NaturezaJuridicaSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { array: true })
  etiquetas: string[];
}

export enum NaturezaJuridicaSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('governo.naturezaJuridica')
export class NaturezaJuridica_ extends BaseTabela_ { }