// Base of the infrastructure error catalog; the global filter turns these into responses.
export abstract class InfrastructureException extends Error {
  constructor(
    readonly title: string,
    message: string,
    readonly httpStatus: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
