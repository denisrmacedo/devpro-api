import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsDateString, IsIP, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from 'class-validator';

import { Base, BaseMovimento_ } from 'src/base/base';
import { Usuario_ } from 'src/base/alfa/usuario/modelo/usuario.entity';
import { Empresa_ } from 'src/base/alfa/empresa/modelo/empresa.entity';

@Entity('seguranca.autorizacao')
export class Autorizacao extends Base {
  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  situacao: AutorizacaoSituacao;

  @IsOptional()
  @IsNumber()
  @Column('boolean', { nullable: false })
  atuante: boolean;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Usuario_, { eager: true })
  @JoinColumn()
  usuario: Usuario_;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Empresa_, { eager: true })
  @JoinColumn()
  empresa: Empresa_;

  @IsNotEmpty()
  @IsIP()
  @Column('varchar', { nullable: false })
  ip: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('integer', { nullable: false })
  aplicativo: number;

  @IsOptional()
  @IsString() @Length(20)
  @Column('varchar', { nullable: false })
  navegador: string;

  @IsOptional()
  @IsString() @Length(20)
  @Column('varchar', { nullable: false })
  horario: string;

  @IsNotEmpty()
  @IsDateString()
  @Column('timestamptz', { nullable: false })
  inicio: Date;

  @IsOptional()
  @IsDateString()
  @Column('timestamptz', { nullable: false })
  conclusao: Date;
}

export enum AutorizacaoSituacao {
  Ativa = 1,
  Concluida = 7,
}

@Entity('seguranca.autorizacao')
export class Autorizacao_ extends BaseMovimento_ { }