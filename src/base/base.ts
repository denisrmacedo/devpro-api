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
  versao: number
}

export class BaseTabela_ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nome: string;
}