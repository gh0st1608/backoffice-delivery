import { Module } from '@nestjs/common';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { HealthController } from './presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    { provide: GetHealthUseCase, useFactory: () => new GetHealthUseCase() },
  ],
})
export class HealthModule {}
