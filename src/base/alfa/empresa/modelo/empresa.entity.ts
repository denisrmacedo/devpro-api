import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUrl, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';
import { Servidor_ } from 'src/base/sistema/servidor/modelo/servidor.entity';

@Entity('alfa.empresa')
export class Empresa extends Base {
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
  situacao: EmpresaSituacao;

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
  @IsObject()
  @OneToOne(() => Servidor_, { eager: true })
  @JoinColumn()
  servidor: Servidor_;
}

export enum EmpresaSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Banida = 8,
  Inativa = 9,
}

@Entity('alfa.empresa')
export class Empresa_ extends BaseTabela_ {
  @Column()
  imagem: string;
}
