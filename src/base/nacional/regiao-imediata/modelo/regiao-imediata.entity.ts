import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Regiao_ } from '../../regiao/modelo/regiao.entity';
import { Uf_ } from '../../uf/modelo/uf.entity';
import { RegiaoIntermediaria_ } from './../../regiao-intermediaria/modelo/regiao-intermediaria.entity';

@Entity('nacional.regiaoImediata')
export class RegiaoImediata extends Base {
  @IsOptional()
  @IsString() @Length(6)
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
  situacao: RegiaoImediataSituacao;

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

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Uf_, { eager: true })
  @JoinColumn()
  uf: Uf_;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => RegiaoIntermediaria_, { eager: true })
  @JoinColumn()
  regiaoIntermediaria: RegiaoIntermediaria_;
}

export enum RegiaoImediataSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('nacional.regiaoImediata')
export class RegiaoImediata_ extends BaseTabela_ {
  @Column()
  imagem: string;
}