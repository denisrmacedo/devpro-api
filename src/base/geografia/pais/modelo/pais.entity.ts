import { Entity, Column, OneToMany } from 'typeorm';
import { ArrayMinSize, IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Length, ValidateNested } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Type } from 'class-transformer';
import { Territorio } from '../../territorio/modelo/territorio.entity';

@Entity('geografia.pais')
export class Pais extends Base {
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

  @IsOptional()
  @IsUrl() @Length(1, 800)
  @Column('varchar')
  icone: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: PaisSituacao;

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
  @IsString() @Length(2, 80)
  @Column('varchar')
  capital: string;

  @IsNotEmpty()
  @IsString() @Length(2)
  @Column('varchar')
  continente: string;

  @IsNotEmpty()
  @IsAlpha() @Length(2)
  @Column('varchar')
  iso2: string;

  @IsNotEmpty()
  @IsAlpha() @Length(2)
  @Column('varchar')
  iso3: string;

  @IsNotEmpty()
  @IsString() @Length(3)
  @Column('varchar')
  tld: string;

  @IsNotEmpty()
  @IsString() @Length(20)
  @Column('varchar')
  discagem: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Territorio)
  @OneToMany(() => Territorio, territorio => territorio.pais, {
    eager: true, cascade: true, orphanedRowAction: 'soft-delete'
  })
  territorios: Territorio[];
}

export enum PaisSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

@Entity('geografia.pais')
export class Pais_ extends BaseTabela_ { }