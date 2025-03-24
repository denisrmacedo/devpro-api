import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AssistenteService } from 'src/turbo/assistente.service';
import { Identificacao } from 'src/autenticacao/identificacao';

@Injectable()
export class ArquivoService {
  private s3: S3Client;
  constructor(
    private readonly assistente: AssistenteService,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESSKEYID,
        secretAccessKey: process.env.AWS_S3_SECRETACCESSKEYID,
      },
    });
  }

  async grava(identificacao: Identificacao, arquivo: Express.MulterS3.File) {
    const idu = (): string => {
      const uuid = randomUUID()
      const table = 'BCDFGHJKLMNPQRSTVWXYZ0123456789'
      const base = table.length
      const hex = uuid.replace(/-/g, '')
      const bigIntValue = BigInt('0x' + hex)
      var result = ''
      var value = bigIntValue
      while (value > 0n) {
        result = table[Number(value % BigInt(base))] + result
        value /= BigInt(base)
      }
      return result.padStart(26, '0')
    }
    const nome = `${idu()}.${arquivo.originalname.split('.').pop()}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: nome,
      Body: arquivo.buffer,
      ContentType: arquivo.mimetype,
    };
    await this.s3.send(new PutObjectCommand(params));
    const recurso = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${nome}`;
    const instrucao: string[] = [];
    instrucao.push(`INSERT INTO integracao.arquivo`);
    instrucao.push(`  (id, adicao, edicao, versao, "autorizacaoId", "empresaId", provedor, nome, tipo, tamanho, recurso)`);
    instrucao.push(`VALUES`);
    instrucao.push(`  (DEFAULT, DEFAULT, DEFAULT, 1, $1, $2, $3, $4, $5, $6, $7);`);
    await this.assistente.gravacao.query(instrucao.join('\n'), [identificacao.id, null, 'AWS', nome, arquivo.mimetype, arquivo.size, recurso]);
    return {
      recurso,
      chave: nome,
    };
  }
}

// https://www.treinaweb.com.br/blog/como-realizar-upload-no-s3-com-nestjs#google_vignette