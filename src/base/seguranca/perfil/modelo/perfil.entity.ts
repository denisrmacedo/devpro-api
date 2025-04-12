import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Length, ValidateNested } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Empresa_ } from 'src/base/administrativo/empresa/modelo/empresa.entity';
import { Type } from 'class-transformer';
import { PerfilRota } from './perfil-rota.entity';

@Entity('seguranca.perfil')
export class Perfil extends Base {
  @IsNotEmpty()
  @OneToOne(() => Empresa_)
  @JoinColumn()
  empresa: Empresa_;

  @IsOptional()
  @IsString() @Length(2, 20)
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
  @IsUrl() @Length(2, 800)
  @Column('varchar')
  imagem: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: PerfilSituacao;

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
  administrador: boolean;

  @Type(() => PerfilRota)
  @ValidateNested({ each: true })
  @IsArray()
  @OneToMany(() => PerfilRota, perfilRota => perfilRota.perfil, { cascade: true, eager: true })
  perfilRotas: PerfilRota[];
}

export enum PerfilSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Banido = 8,
  Inativo = 9,
}

@Entity('seguranca.perfil')
export class Perfil_ extends BaseTabela_ {
  @Column()
  imagem: string;
}