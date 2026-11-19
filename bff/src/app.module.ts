import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health';
import { validate } from './shared/infrastructure/config/environment';
import { HttpModule } from './shared/infrastructure/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    HttpModule,
    HealthModule,
  ],
})
export class AppModule {}
