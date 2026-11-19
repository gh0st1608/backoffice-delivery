import { HealthStatus } from '../../domain/health-status';

export class GetHealthUseCase {
  execute(): HealthStatus {
    return { status: 'ok' };
  }
}
