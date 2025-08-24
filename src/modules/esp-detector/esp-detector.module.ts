import { Module } from '@nestjs/common';
import { EspDetectorService } from './esp-detector.service';

@Module({
  providers: [EspDetectorService],
  exports: [EspDetectorService],
})
export class EspDetectorModule {}
