import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsDateString, IsJSON, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, Length } from 'class-validator';

import { Base, Modelo } from 'src/base/base';
import { Usuario_ } from 'src/base/alfa/usuario/modelo/usuario.entity';
import { Autorizacao_ } from '../../autorizacao/modelo/autorizacao.entity';

@Entity('seguranca.auditoria')
export class Auditoria extends Base {
  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Usuario_, { eager: true })
  @JoinColumn()
  usuario: Usuario_;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Autorizacao_, { eager: true })
  @JoinColumn()
  autorizacao: Autorizacao_;

  @IsNotEmpty()
  @IsString() @Length(20)
  @Column('varchar', { nullable: false })
  horario: string;

  @IsNotEmpty()
  @IsDateString()
  @Column('timestamptz', { nullable: false })
  momento: Date;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  procedimento: AuditoriaProcedimento;

  @IsNotEmpty()
  @IsJSON()
  @Column('json', { nullable: false })
  instancia: string;

  @IsNotEmpty()
  @IsUUID()
  @Column('uuid', { nullable: false })
  instanciaId: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  instanciaModelo: Modelo;

  @IsNotEmpty()
  @IsString() @Length(80)
  @Column('varchar', { nullable: false })
  instanciaDescricao: string;
}

export enum AuditoriaProcedimento {
  Adicao = 1,
  Edicao = 2,
  Remocao = 3,
}