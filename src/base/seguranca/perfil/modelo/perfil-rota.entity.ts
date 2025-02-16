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
  @Column()
  rota: string;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	acessar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	adicionar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	editar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	remover: number;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	compartilhar: number;

  @IsNotEmpty()
  @IsNumber()
  @Column()
	aprovar: number;

  @IsNumber()
  @IsNotEmpty()
  @Column()
	reverter: number;
}