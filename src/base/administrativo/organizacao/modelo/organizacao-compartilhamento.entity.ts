import { Entity, Column } from 'typeorm';
import { IsBoolean, IsNotEmpty } from 'class-validator';

import { Base } from 'src/base/base';

@Entity('administrativo.organizacaoCompartilhamento')
export class OrganizacaoCompartilhamento extends Base {
  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  financeiro: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  estoque: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  deposito: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  venda: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  compra: boolean;
}