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

  @VersionColumn()
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
  Usuario = +'010100',
  Empresa = +'010200',
  Servidor = +'710100',
}

/*
  Esquema
    Alfa = 01
    Sistema = 71
*/

export enum Procedimento {
  Adicao = 1,
  Edicao = 2,
  Remocao = 3,
}