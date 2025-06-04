import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Uf } from './modelo/uf.entity';
import { UfService } from './uf.service';
import { UfController } from './uf.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Uf], 'gravacao'),
    TypeOrmModule.forFeature([Uf], 'leitura'),
    TurboModule,
  ],
  exports: [
    UfService,
  ],
  providers: [
    UfService,
  ],
  controllers: [
    UfController,
  ],
})
export class UfModule { }
