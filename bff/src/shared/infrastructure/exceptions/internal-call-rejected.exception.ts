import { InfrastructureException } from './infrastructure.exception';

// Without a user token a 401/403 means the BFF's own key was rejected, not the user.
// The response looks like an unavailable service; only the log tells them apart.
export class InternalCallRejectedException extends InfrastructureException {
  constructor(service: string, cause: string) {
    super('Bad Gateway', `The ${service} service is unavailable`, 502, {
      cause: `${cause} (internal call rejected; check the BFF internal api key)`,
    });
  }
}
