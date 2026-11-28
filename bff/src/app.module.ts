import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HealthModule } from './modules/health';
import { apiKeyConfig } from './shared/infrastructure/config/api-key.config';
import { validate } from './shared/infrastructure/config/environment';
import { httpConfig } from './shared/infrastructure/config/http.config';
import { servicesConfig } from './shared/infrastructure/config/services.config';
import { GlobalExceptionFilter } from './shared/infrastructure/filters/exception.filter';
import { HttpModule } from './shared/infrastructure/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [servicesConfig, httpConfig, apiKeyConfig],
    }),
    HttpModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
