import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsDateString, IsJSON, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, Length } from 'class-validator';

import { Base, Modelo } from 'src/base/base';
import { Usuario_ } from 'src/base/administrativo/usuario/modelo/usuario.entity';
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
  @Column('varchar')
  horario: string;

  @IsNotEmpty()
  @IsDateString()
  @Column('timestamptz')
  instante: Date;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  procedimento: AuditoriaProcedimento;

  @IsNotEmpty()
  @IsJSON()
  @Column('json')
  instancia: string;

  @IsNotEmpty()
  @IsUUID()
  @Column('uuid')
  instanciaId: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  instanciaModelo: Modelo;

  @IsNotEmpty()
  @IsString() @Length(80)
  @Column('varchar')
  instanciaDescricao: string;
}

export enum AuditoriaProcedimento {
  Adicao = 1,
  Edicao = 2,
  Remocao = 3,
}