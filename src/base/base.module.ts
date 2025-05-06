import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { types } from 'pg';
import 'dotenv/config';

types.setTypeParser(types.builtins.INT8, (value: string) => parseInt(value));
types.setTypeParser(types.builtins.FLOAT4, (value: string) => parseFloat(value));
types.setTypeParser(types.builtins.FLOAT8, (value: string) => parseFloat(value));
types.setTypeParser(types.builtins.NUMERIC, (value: string) => parseFloat(value));

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'gravacao',
      type: 'postgres',
      host: process.env.DB_GRAVACAO_HOST,
      port: +process.env.DB_GRAVACAO_PORT,
      username: process.env.DB_GRAVACAO_USERNAME,
      password: process.env.DB_GRAVACAO_PASSWORD,
      database: process.env.DB_GRAVACAO_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl: {
        rejectUnauthorized: false,
      },
      logger: 'advanced-console',
      logging: 'all',
      synchronize: false,
    }),
    TypeOrmModule.forRoot({
      name: 'leitura',
      type: 'postgres',
      host: process.env.DB_LEITURA_HOST,
      port: +process.env.DB_LEITURA_PORT,
      username: process.env.DB_LEITURA_USERNAME,
      password: process.env.DB_LEITURA_PASSWORD,
      database: process.env.DB_LEITURA_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl: {
        rejectUnauthorized: false,
      },
      logger: 'advanced-console',
      logging: 'all',
      synchronize: false,
      //https://medium.com/@penetra.okulo/error-no-pg-hba-conf-71f74a24c6e7
      //https://github.com/dbeaver/dbeaver/issues/21616
    }),
  ],
})
export class BaseModule { }