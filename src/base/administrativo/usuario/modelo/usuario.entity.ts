import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUrl, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { Base, BaseTabela_ } from 'src/base/base';
import { Empresa_ } from '../../empresa/modelo/empresa.entity';
import { UsuarioCredencial } from './usuario-credencial.entity';
import { UsuarioEmpresa } from './usuario-empresa.entity';

@Entity('administrativo.usuario')
export class Usuario extends Base {
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
  situacao: UsuarioSituacao;

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

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  administrador: boolean;

  @IsOptional()
  @Length(1, 80)
  @Column('varchar')
  celular: string;

  @IsOptional()
  @Length(1, 80)
  @Column('varchar')
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  tema: UsuarioTema;

  @IsOptional()
  @Length(1, 800)
  @Column('varchar')
  observacoes: string;

  @IsOptional()
  @IsObject()
  @OneToOne(() => Empresa_, { eager: true })
  @JoinColumn()
  empresa: Empresa_;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UsuarioCredencial)
  @OneToMany(() => UsuarioCredencial, usuarioCredencial => usuarioCredencial.usuario, {
    eager: true, cascade: true, orphanedRowAction: 'soft-delete'
  })
  usuarioCredenciais: UsuarioCredencial[];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => UsuarioEmpresa)
  @OneToMany(() => UsuarioEmpresa, usuarioEmpresa => usuarioEmpresa.usuario, {
    eager: true, cascade: true, orphanedRowAction: 'soft-delete'
  })
  usuarioEmpresas: UsuarioEmpresa[];
}

export enum UsuarioSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Banido = 8,
  Inativo = 9,
}

export enum UsuarioTema {
  Escuro = 0,
  Claro = 1,
  Sistema = 2,
}

@Entity('administrativo.usuario')
export class Usuario_ extends BaseTabela_ {
  @Column()
  imagem: string;
}