import { Global, Module } from '@nestjs/common';
import { ServiceHttpClient } from './service-http-client';

@Global()
@Module({
  providers: [ServiceHttpClient],
  exports: [ServiceHttpClient],
})
export class HttpModule {}
