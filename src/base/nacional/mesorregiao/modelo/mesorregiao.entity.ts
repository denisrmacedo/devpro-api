import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Regiao_ } from '../../regiao/modelo/regiao.entity';
import { Uf_ } from '../../uf/modelo/uf.entity';

@Entity('nacional.mesorregiao')
export class Mesorregiao extends Base {
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
  situacao: MesorregiaoSituacao;

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
}

export enum MesorregiaoSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('nacional.mesorregiao')
export class Mesorregiao_ extends BaseTabela_ {
  @Column()
  imagem: string;
}