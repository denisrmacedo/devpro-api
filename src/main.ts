import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from '@fastify/compress';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.register(compression, { encodings: ['gzip', 'deflate'] });
  app.useGlobalPipes(new ValidationPipe());
  const types = require('pg').types;
  const config = new DocumentBuilder()
    .setTitle('Aurora API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);
  const port = +process.env.PORT || 3000;
  await app.listen(port, (err, address) => {
    console.log(`🚀 API funcionando em ${address}`);
  });
}
bootstrap();