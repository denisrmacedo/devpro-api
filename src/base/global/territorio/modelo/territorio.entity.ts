import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Pais_ } from 'src/base/global/pais/modelo/pais.entity';

@Entity('global.territorio')
export class Territorio extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Pais_)
  @JoinColumn()
  pais: Pais_;

  @IsOptional()
  @IsString() @Length(5)
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
  situacao: TerritorioSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  // @IsOptional()
  // @IsArray()
  // @Column('varchar', { array: true })
  // etiquetas: string[];

  @IsNotEmpty()
  @IsString() @Length(5, 10)
  @Column('varchar')
  iso: string;

  @IsNotEmpty()
  @IsString() @Length(3)
  @Column('varchar')
  categoria: string;
}

export enum TerritorioSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

@Entity('global.territorio')
export class Territorio_ extends BaseTabela_ { }