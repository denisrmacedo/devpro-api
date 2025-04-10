import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Empresa_ } from 'src/base/alfa/empresa/modelo/empresa.entity';

@Entity('alfa.estabelecimento')
export class Estabelecimento extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Empresa_, { eager: true })
  @JoinColumn()
  empresa: Empresa_;

  @IsOptional()
  @Length(2, 20)
  @Column('varchar', { nullable: false })
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar', { nullable: false })
  nome: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  situacao: EstabelecimentoSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { nullable: true, array: true })
  etiquetas: string[];

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  super: boolean;

  @IsOptional()
  @Length(1, 800)
  @Column('varchar', { nullable: true })
  observacoes: string;
}

export enum EstabelecimentoSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

@Entity('alfa.estabelecimento')
export class Estabelecimento_ extends BaseTabela_ { }
