import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsDateString, IsIP, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from 'class-validator';

import { Base } from 'src/base/base';
import { Usuario } from 'src/base/alfa/usuario/modelo/usuario.entity';

@Entity('seguranca.sessao')
export class Sessao extends Base {
  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  situacao: SessaoSituacao;

  @IsOptional()
  @IsNumber()
  @Column('boolean', { nullable: false })
  operacional: boolean;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Usuario, { eager: true })
  @JoinColumn()
  usuario: Usuario;

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
  fuso: string;

  @IsNotEmpty()
  @IsDateString()
  @Column('timestamptz', { nullable: false })
  inicio: Date;

  @IsOptional()
  @IsDateString()
  @Column('timestamptz', { nullable: false })
  conclusao: Date;
}

export enum SessaoSituacao {
  Ativa = 1,
  Concluida = 7,
}