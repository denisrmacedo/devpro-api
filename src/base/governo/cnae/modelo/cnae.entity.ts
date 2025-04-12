import { Entity, Column } from 'typeorm';
import { IsAlpha, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

import { Base, BaseTabela_ } from 'src/base/base';

@Entity('governo.cnae')
export class Cnae extends Base {
  @IsOptional()
  @Length(1, 40)
  @Column('varchar')
  codigo: string;

  @IsNotEmpty()
  @Length(2, 200)
  @Column('varchar')
  nome: string;

  @IsOptional()
  @Length(2, 200)
  @Column('varchar')
  descricao: string;

  @IsNotEmpty()
  @IsNumber()
  @Column('smallint')
  situacao: CnaeSituacao;

  @IsOptional()
  @IsBoolean()
  @Column('boolean')
  atuante: boolean;

  @IsOptional()
  @IsArray()
  @Column('varchar', { array: true })
  etiquetas: string[];

  @IsOptional()
  @IsAlpha()
  @Column('varchar')
  area: string;

  @IsNotEmpty()
  @IsBoolean()
  @Column('boolean')
  fatorR: string;

  @IsOptional()
  @IsNumber()
  @Column('decimal')
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
