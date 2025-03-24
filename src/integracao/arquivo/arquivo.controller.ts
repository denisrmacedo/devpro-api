import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { ArquivoService } from './arquivo.service';
import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';

@Controller('integracao/arquivo')
export class ArquivoController {
  constructor(
    private readonly arquivoService: ArquivoService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('arquivo'))
  grava(@Auth() identificacao: Identificacao, @UploadedFile() arquivo: Express.MulterS3.File) {
    return this.arquivoService.grava(identificacao, arquivo);
  }
}