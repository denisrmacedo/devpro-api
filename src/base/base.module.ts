import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'principal',
      type: 'postgres',
      host: process.env.DB_PRINCIPAL_HOST,
      port: +process.env.DB_PRINCIPAL_PORT,
      username: process.env.DB_PRINCIPAL_USERNAME,
      password: process.env.DB_PRINCIPAL_PASSWORD,
      database: process.env.DB_PRINCIPAL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logger: 'advanced-console',
      logging: 'all',
      synchronize: false,
    }),
    TypeOrmModule.forRoot({
      name: 'replica',
      type: 'postgres',
      host: process.env.DB_REPLICA_HOST,
      port: +process.env.DB_REPLICA_PORT,
      username: process.env.DB_REPLICA_USERNAME,
      password: process.env.DB_REPLICA_PASSWORD,
      database: process.env.DB_REPLICA_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logger: 'advanced-console',
      logging: 'all',
      synchronize: false,
    }),
  ],
})
export class BaseModule {}