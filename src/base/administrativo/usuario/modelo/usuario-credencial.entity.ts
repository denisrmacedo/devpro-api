import { Base } from 'src/base/base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Usuario } from './usuario.entity';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

@Entity('administrativo.usuarioCredencial')
export class UsuarioCredencial extends Base {
  @ManyToOne(() => Usuario, usuario => usuario.usuarioCredenciais)
  usuario: Usuario;

  @IsNotEmpty()
  @Length(2, 120)
  @Column()
  chave: string;

  @IsOptional()
  @Length(2, 120)
  @Column()
  senha: string;

  @IsOptional()
  @Length(5, 80)
  @Column()
  pergunta: string;

  @IsOptional()
  @Length(1, 80)
  @Column()
  resposta: string;
}