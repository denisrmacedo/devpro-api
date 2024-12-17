import { Entity, Column } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('sistema.servidor')
export class Servidor extends Base {
  @IsNotEmpty()
  @Length(2, 20)
  @Column('varchar', { nullable: false })
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar', { nullable: false })
  nome: string;

  @IsOptional()
  @IsUrl()
  @Column('varchar', { nullable: true, length: 800 })
  imagem: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  situacao: ServidorSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { nullable: true, array: true })
  legendas: string[];

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  super: boolean;

  @IsOptional()
  @IsUrl()
  @Column('varchar', { nullable: true, length: 800 })
  gravacao: string;

  @IsOptional()
  @IsUrl()
  @Column('varchar', { nullable: true, length: 800 })
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