import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { IsArray, IsNotEmpty } from 'class-validator';

import { Base, BaseSituacao } from 'src/base/base';
import { Usuario } from './usuario.entity';
import { Organizacao_ } from '../../organizacao/modelo/organizacao.entity';

@Entity('administrativo.usuarioOrganizacao')
export class UsuarioOrganizacao extends Base {
  @ManyToOne(() => Usuario, usuario => usuario.usuarioOrganizacoes)
  usuario: Usuario;

  @IsNotEmpty()
  @Column('smallint')
  situacao: BaseSituacao;

  @IsNotEmpty()
  @OneToOne(() => Organizacao_, { eager: true })
  @JoinColumn()
  organizacao: Organizacao_;

  @IsNotEmpty()
  @IsArray()
  @Column('uuid', { array: true })
  filialIds: string[];

  @IsNotEmpty()
  @IsArray()
  @Column('uuid', { array: true })
  perfilIds: string[];
}