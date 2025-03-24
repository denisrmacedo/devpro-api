import { Module } from '@nestjs/common';

import { TurboModule } from 'src/turbo/turbo.module';
import { ArquivoService } from './arquivo.service';
import { ArquivoController } from './arquivo.controller';

@Module({
  imports: [
    TurboModule,
  ],
  exports: [
    ArquivoService,
  ],
  providers: [
    ArquivoService,
  ],
  controllers: [
    ArquivoController,
  ],
})
export class ArquivoModule { }
