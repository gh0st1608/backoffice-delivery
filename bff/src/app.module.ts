import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health';
import { validate } from './shared/infrastructure/config/environment';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate }), HealthModule],
})
export class AppModule {}
