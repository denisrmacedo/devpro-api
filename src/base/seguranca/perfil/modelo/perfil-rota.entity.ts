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
  @Column('varchar', { nullable: false, length: 200 })
  rota: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	acessar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	adicionar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	editar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })@Column()
	remover: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	compartilhar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	aprovar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
	reverter: number;
}