import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Organizacao_ } from 'src/base/administrativo/organizacao/modelo/organizacao.entity';

@Entity('administrativo.filial')
export class Filial extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Organizacao_, { eager: true })
  @JoinColumn()
  organizacao: Organizacao_;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Organizacao_, { eager: true })
  @JoinColumn()
  empresa: Organizacao_;

  @IsOptional()
  @Length(2, 20)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 100)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @Length(2, 5)
  @Column('varchar')
  sigla: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: FilialSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { array: true })
  etiquetas: string[];

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  super: boolean;

  @IsOptional()
  @Length(1, 800)
  @Column('varchar')
  observacoes: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  produtorRural: FilialProdutorRural;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  contribuinte: FilialContribuinte;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  distribuidora: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  lojistica: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  sngpc: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  pontuacao: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  consolidacao: boolean;

  @IsOptional()
  @Length(1, 8)
  @Column('varchar')
  fpas: string;

  @IsOptional()
  @Length(1, 8)
  @Column('varchar')
  rais: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  importacao: FilialImportacao;
}

export enum FilialSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

export enum FilialProdutorRural {
  Nenhum = 0,
  Fisica = 1,
  Juridica = 2,
  SeguradoEspecial = 3,
}

export enum FilialContribuinte {
  Nenhum = 0,
  ICMS = 1,
  Isento = 2,
  NaoContribuinte = 3,
}

export enum FilialImportacao {
  Nenhum = 0,
  Importador = 1,
  Consignatario = 2
}

@Entity('administrativo.filial')
export class Filial_ extends BaseTabela_ { }
