import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { Identificacao } from './identificacao';

export const Auth = createParamDecorator(
  (data: any, context: ExecutionContext): Identificacao => {
    const request = context.switchToHttp().getRequest<Request>();
    const identificacao = request['identificacao'];
    if (!identificacao) {
      throw new UnauthorizedException('Token inválido ou ausente');
    }
    identificacao.ip = request.ip;
    return identificacao;
  }
);
// https://matthewdavis.io/adding-context-to-your-requests-with-nest-js/