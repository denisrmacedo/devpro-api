import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

import { Base, BaseSituacao } from 'src/base/base';
import { Usuario } from './usuario.entity';
import { Empresa_ } from '../../empresa/modelo/empresa.entity';

@Entity('alfa.usuarioEmpresa')
export class UsuarioEmpresa extends Base {
  @ManyToOne(() => Usuario, usuario => usuario.usuarioEmpresas)
  usuario: Usuario;

  @IsNotEmpty()
  @Column('smallint', { nullable: false })
  situacao: BaseSituacao;

  @IsNotEmpty()
  @OneToOne(() => Empresa_, { eager: true })
  @JoinColumn()
  empresa: Empresa_;

  @IsNotEmpty()
  @IsArray()
  @Column('uuid', { array: true })
  perfilIds: string[];
}