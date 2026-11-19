import { Controller, Get } from '@nestjs/common';
import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case';

@Controller('health')
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get()
  get() {
    return this.getHealth.execute();
  }
}
