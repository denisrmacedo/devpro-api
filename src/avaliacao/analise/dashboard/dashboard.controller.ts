import { Controller, Query, Get } from '@nestjs/common';

import { Auth } from 'src/autenticacao/auth.decorator';
import { Identificacao } from 'src/autenticacao/identificacao';
import { DashboardService } from './dashboard.service';

@Controller('avaliacao/analise/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/resumo')
  acesso(@Auth() identificacao: Identificacao, @Query() criterios: any): Promise<any> {
    return this.dashboardService.resumo(identificacao, criterios);
  }

}