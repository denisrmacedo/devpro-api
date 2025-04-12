import { Entity, Column } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('sistema.servidor')
export class Servidor extends Base {
  @IsOptional()
  @Length(2, 20)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsOptional()
  @IsUrl()
  @Column('varchar')
  imagem: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: ServidorSituacao;

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
  @IsUrl()
  @Column('varchar')
  gravacao: string;

  @IsOptional()
  @IsUrl()
  @Column('varchar')
  leitura: string;
}

export enum ServidorSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Banido = 8,
  Inativo = 9,
}

@Entity('sistema.servidor')
export class Servidor_ extends BaseTabela_ {
  @Column()
  imagem: string;

  @Column()
  gravacao: string;

  @Column()
  leitura: string;
}