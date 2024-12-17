import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

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
      logger: 'advanced-console',
      logging: 'all',
      synchronize: false,
    }),
  ],
})
export class BaseModule {}