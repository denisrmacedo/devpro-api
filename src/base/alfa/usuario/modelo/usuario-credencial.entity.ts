import { Base } from "src/base/base";
import { Column, Entity, ManyToOne } from "typeorm";
import { Usuario } from "./usuario.entity";
import { IsNotEmpty, IsOptional, Length } from "class-validator";

@Entity('alfa.usuarioCredencial')
export class UsuarioCredencial extends Base {
  @ManyToOne(() => Usuario, usuario => usuario.usuarioCredenciais)
  usuario: Usuario;

  @IsNotEmpty()
  @Length(2, 120)
  @Column('varchar', { nullable: false, length: 120 })
  chave: string;

  @IsOptional()
  @Length(2, 120)
  @Column('varchar', { nullable: false, length: 120 })
  senha: string;
}