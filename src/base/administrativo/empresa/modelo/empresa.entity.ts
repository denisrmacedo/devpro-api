import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Servidor_ } from 'src/base/sistema/servidor/modelo/servidor.entity';

@Entity('administrativo.empresa')
export class Empresa extends Base {
  @IsOptional()
  @Length(2, 20)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 80)
  @Column('varchar')
  nome: string;

  @IsOptional()
  @IsUrl() @Length(1, 800)
  @Column('varchar')
  imagem: string;

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

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  atividade: EmpresaAtividade;

  @IsOptional()
  @Length(1, 800)
  @Column('varchar')
  observacoes: string;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Servidor_, { eager: true })
  @JoinColumn()
  servidor: Servidor_;
}

export enum EmpresaSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

export enum EmpresaAtividade {
  Geral = 0,
  Supermercado = 1,
  Mercearia = 2,
  Utilidades = 3,
  Atacado = 4,
  Varejo = 5,
  Industria = 6,
  Tecnologia = 7,
  Servicos = 8,
  Saude = 9,
  Educacao = 10,
  Alimentacao = 12,
  Transporte = 14,
  Construcao = 15,
  Agricultura = 17,
  Entretenimento = 18,
  Governo = 30,
}

@Entity('administrativo.empresa')
export class Empresa_ extends BaseTabela_ {
  @Column()
  imagem: string;
}
