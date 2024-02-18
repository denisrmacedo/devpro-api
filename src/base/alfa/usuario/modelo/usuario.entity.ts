import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate, getConnection } from 'typeorm';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsUrl, Length, ValidateNested, isURL } from 'class-validator';
import { Type } from 'class-transformer';

import { Base, BaseTabela_ } from 'src/base/base';
import { UsuarioCredencial } from './usuario-credencial.entity';

@Entity('alfa.usuario')
export class Usuario extends Base {
  @IsNotEmpty()
  @Length(2, 20)
  @Column('varchar', { nullable: false })
  codigo: string;

  @IsOptional()
  @IsInt()
  @Column('int', { nullable: false })
  numero: number;

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
  situacao: UsuarioSituacao;

  @IsOptional()
  @IsNumber()
  @Column('boolean', { nullable: false })
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { nullable: true, array: true })
  legendas: string[];

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  genero: UsuarioGenero;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  mestre: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  administrador: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UsuarioCredencial)
  @OneToMany(() => UsuarioCredencial, usuarioCredencial => usuarioCredencial.usuario, { eager: true, cascade: true, orphanedRowAction: 'soft-delete' })
  usuarioCredenciais: UsuarioCredencial[];
}

export enum UsuarioSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Banido = 8,
  Inativo = 9,
}

export enum UsuarioGenero {
  Masculino = 1,
  Feminino = 2,
  NaoInformado = 9,
}

@Entity('usuario')
export class Usuario_ extends BaseTabela_ {
  @Column()
  imagem: string;
}
