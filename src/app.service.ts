import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  saudacao(): string {
    return 'Aurora';
  }
}
