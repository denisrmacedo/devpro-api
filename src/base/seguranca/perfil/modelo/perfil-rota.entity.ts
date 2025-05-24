import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Base } from 'src/base/base';
import { Perfil } from './perfil.entity';

@Entity('seguranca.perfilRota')
export class PerfilRota extends Base {
  @ManyToOne(() => Perfil, perfil => perfil.perfilRotas)
  perfil: Perfil;

  @IsNotEmpty()
  @IsString() @Length(10, 200)
  @Column('varchar')
  rota: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  acessa: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  adiciona: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  edita: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint') @Column()
  remove: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  compartilha: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  aprova: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  reverte: number;
}