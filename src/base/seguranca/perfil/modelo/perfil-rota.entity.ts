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
	acessar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
	adicionar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
	editar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')@Column()
	remover: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
	compartilhar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
	aprovar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
	reverter: number;
}