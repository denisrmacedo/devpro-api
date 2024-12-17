import { Module } from '@nestjs/common';

import { AssistenteService } from 'src/turbo/assistente.service';

@Module({
  imports: [],
  exports: [
    AssistenteService,
  ],
  providers: [
    AssistenteService,
  ],
})
export class TurboModule { }
