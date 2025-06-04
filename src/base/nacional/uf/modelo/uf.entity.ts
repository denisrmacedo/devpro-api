import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUppercase, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Regiao_ } from '../../regiao/modelo/regiao.entity';

@Entity('nacional.uf')
export class Uf extends Base {
  @IsOptional()
  @IsString() @Length(3)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @IsString() @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @IsString() @Length(2, 2) @IsUppercase() @IsAlpha()
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
  situacao: UfSituacao;

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
  @IsObject()
  @OneToOne(() => Regiao_, { eager: true })
  @JoinColumn()
  regiao: Regiao_;
}

export enum UfSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('nacional.uf')
export class Uf_ extends BaseTabela_ {
  @Column()
  imagem: string;
}