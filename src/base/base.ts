import { NaturezaJuridica } from './governo/natureza-juridica/modelo/natureza-juridica.entity';
import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  adicao: Date;

  @UpdateDateColumn()
  edicao: Date;

  @DeleteDateColumn()
  remocao: Date;

  @VersionColumn({ select: false })
  versao: number;

  get novo(): boolean {
    return !!this.id;
  }
}

export class BaseTabela_ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nome: string;
}

export class BaseMovimento_ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;
}

export enum Modelo {
  Usuario = +'030100',
  Empresa = +'030200',
  Estabelecimento = +'030300',
  Cnae = +'040100',
  NaturezaJuridica = +'040200',
  GrupoTributario = +'040300',
  Pais = +'050100',
  Territorio = +'050200',
  Perfil = +'020100',
  Servidor = +'010100',
}

/*
  Esquema
    Administrativo = 03
    Governo = 04
    Geografia = 05
    Seguranca = 02
    Sistema = 01
*/

export enum Procedimento {
  Adicao = 1,
  Edicao = 2,
  Remocao = 3,
}

export enum BaseSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Banida = 8,
  Inativa = 9,
}