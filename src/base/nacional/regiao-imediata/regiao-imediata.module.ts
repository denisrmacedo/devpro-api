import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurboModule } from 'src/turbo/turbo.module';
import { RegiaoImediata } from './modelo/regiao-imediata.entity';
import { RegiaoImediataService } from './regiao-imediata.service';
import { RegiaoImediataController } from './regiao-imediata.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([RegiaoImediata], 'gravacao'),
    TypeOrmModule.forFeature([RegiaoImediata], 'leitura'),
    TurboModule,
  ],
  exports: [
    RegiaoImediataService,
  ],
  providers: [
    RegiaoImediataService,
  ],
  controllers: [
    RegiaoImediataController,
  ],
})
export class RegiaoImediataModule { }
