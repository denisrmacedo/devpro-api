import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { Servidor } from './modelo/servidor.entity';
import { ServidorService } from './servidor.service';
import { ServidorController } from './servidor.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Servidor], 'gravacao'),
    TypeOrmModule.forFeature([Servidor], 'leitura'),
    TurboModule,
  ],
  exports: [
    ServidorService,
  ],
  providers: [
    ServidorService,
  ],
  controllers: [
    ServidorController,
  ],
})
export class ServidorModule {}
