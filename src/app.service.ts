import { Injectable } from '@nestjs/common';
import { aplicativo } from './app.properties';

@Injectable()
export class AppService {
  saudacao(): string {
    return 'Aurora 🌅';
  }

  propriedades(): any {
    return {
      projeto: 'Aurora 🌅',
      aplicativo,
    };
  }
}
