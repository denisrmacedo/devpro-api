import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from '@fastify/compress';

import { AppModule } from './app.module';
import { aplicativo } from './app.properties';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.register(compression, { encodings: ['gzip', 'deflate'] });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Aurora API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const { name, version } = require(join(process.cwd(), 'package.json'));

  await app.listen(+process.env.PORT || 3000, (err, address) => {
    if (aplicativo.nome.localeCompare(name, undefined, { sensitivity: 'base' })) {
      Logger.error(`Informações divergentes com o arquivo package.json "name" ${aplicativo.nome} != ${name}`);
    }
    if (aplicativo.versao.localeCompare(version)) {
      Logger.error(`Informações divergentes com o arquivo package.json "version" ${aplicativo.versao} != ${version}`);
    }
    Logger.verbose(`Aplicativo: Aurora/${aplicativo.nome.toUpperCase()}`, 'Propriedades');
    Logger.verbose(`Versão: ${aplicativo.versao}`, 'Propriedades');
    if (!err) {
      Logger.verbose(`Rota: ${address} 🚀`, 'Propriedades');
      return;
    }
    Logger.error(`🆘 ${JSON.stringify(err)}`);
  });
}
bootstrap();