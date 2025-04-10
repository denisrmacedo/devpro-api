import { Entity, Column } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('governo.cnae')
export class Cnae extends Base {
  @IsOptional()
  @Length(1, 40)
  @Column('varchar', { nullable: false })
  codigo: string;

  @IsNotEmpty()
  @Length(2, 200)
  @Column('varchar', { nullable: false })
  nome: string;

  @IsOptional()
  @Length(2, 200)
  @Column('varchar', { nullable: false })
  descricao: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint', { nullable: false })
  situacao: CnaeSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { nullable: true, array: true })
  etiquetas: string[];

  @IsOptional()
  @IsAlpha()
  @Column('varchar', { nullable: false })
  area: string;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean', { nullable: false })
  fatorR: string;

  @IsOptional()
  @IsNumber()
  @Column('decimal', { nullable: false })
  fatorRAliquota: number;
}

export enum CnaeSituacao {
  Rascunho = 0,
  Ativa = 1,
  Suspensa = 6,
  Inativa = 9,
}

@Entity('governo.cnae')
export class Cnae_ extends BaseTabela_ {
  @Column()
  imagem: string;
}
