import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Territorio } from './modelo/territorio.entity';
import { TerritorioService } from './territorio.service';
import { TerritorioController } from './territorio.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Territorio], 'gravacao'),
    TypeOrmModule.forFeature([Territorio], 'leitura'),
    TurboModule,
  ],
  exports: [
    TerritorioService,
  ],
  providers: [
    TerritorioService,
  ],
  controllers: [
    TerritorioController,
  ],
})
export class TerritorioModule { }
