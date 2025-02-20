import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUrl, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { Base, BaseTabela_ } from 'src/base/base';
import { Empresa_ } from '../../empresa/modelo/empresa.entity';
import { UsuarioCredencial } from './usuario-credencial.entity';
import { UsuarioEmpresa } from './usuario-empresa.entity';

@Entity('alfa.usuario')
export class Usuario extends Base {
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
  situacao: UsuarioSituacao;

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

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  administrador: boolean;

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

@Entity('alfa.usuario')
export class Usuario_ extends BaseTabela_ {
  @Column()
  imagem: string;
}