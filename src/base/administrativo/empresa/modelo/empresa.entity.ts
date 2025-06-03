import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Organizacao_ } from 'src/base/administrativo/organizacao/modelo/organizacao.entity';
import { Cnae_ } from 'src/base/governo/cnae/modelo/cnae.entity';
import { NaturezaJuridica_ } from './../../../governo/natureza-juridica/modelo/natureza-juridica.entity';

@Entity('administrativo.empresa')
export class Empresa extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Organizacao_, { eager: true })
  @JoinColumn()
  organizacao: Organizacao_;

  @IsOptional()
  @Length(2, 20)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: EmpresaSituacao;

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
  @Length(1, 1000)
  @Column('varchar')
  observacoes: string;

  @IsNotEmpty()
  @Length(2, 100)
  @Column('varchar')
  razaoSocial: string;

  @IsNotEmpty()
  @Length(2, 20)
  @Column('varchar')
  cnpj: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  inscricao: EmpresaInscricao;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Cnae_, { eager: true })
  @JoinColumn()
  cnae: Cnae_;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => NaturezaJuridica_, { eager: true })
  @JoinColumn()
  naturezaJuridica: NaturezaJuridica_;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  regimeTributario: EmpresaRegimeTributario;
}

export enum EmpresaSituacao {
  Rascunho = 0,
  Ativo = 1,
  Suspenso = 6,
  Inativo = 9,
}

export enum EmpresaInscricao {
  Nenhuma = 0,
  CEI = 1,
  CNPJ = 2,
  CPF = 3,
  INCRA = 4,
}

export enum EmpresaRegimeTributario {
  Nenhum = 0,
  SimplesNacional = 1,
  LucroReal = 2,
  LucroPresumido = 3,
  MEI = 4,
}

@Entity('administrativo.empresa')
export class Empresa_ extends BaseTabela_ { }
