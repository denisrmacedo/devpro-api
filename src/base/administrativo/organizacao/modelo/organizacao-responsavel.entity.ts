import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsObject, Length } from 'class-validator';

import { Base } from 'src/base/base';
import { Ddi_ } from 'src/base/global/ddi/modelo/ddi.entity';

@Entity('administrativo.organizacaoResponsavel')
export class OrganizacaoResponsavel extends Base {
  @IsNotEmpty()
  @Length(1, 100)
  @Column('varchar')
  nome: string;

  @IsNotEmpty()
  @Length(1, 20)
  @Column('varchar')
  cpf: string;

  @IsNotEmpty()
  @Length(1, 100)
  @Column('varchar')
  email: string;

  @IsNotEmpty()
  @IsObject()
  @OneToOne(() => Ddi_, { eager: true })
  @JoinColumn()
  ddi: Ddi_;

  @IsNotEmpty()
  @Length(1, 50)
  @Column('varchar')
  telefone: string;

  @IsNotEmpty()
  @Length(1, 50)
  @Column('varchar')
  telefoneRamal: string;
}