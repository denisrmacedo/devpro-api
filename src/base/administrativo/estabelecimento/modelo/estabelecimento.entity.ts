import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Empresa_ } from 'src/base/administrativo/empresa/modelo/empresa.entity';

@Entity('administrativo.estabelecimento')
export class Estabelecimento extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Empresa_, { eager: true })
  @JoinColumn()
  empresa: Empresa_;

  @IsOptional()
  @Length(2, 20)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: EstabelecimentoSituacao;

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
}

export enum EstabelecimentoSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

@Entity('administrativo.estabelecimento')
export class Estabelecimento_ extends BaseTabela_ { }
