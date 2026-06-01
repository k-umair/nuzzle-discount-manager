import { Module } from '@nestjs/common';
import { CodesModule } from './codes/codes.module';

@Module({
  imports: [CodesModule],
})
export class AppModule {}
