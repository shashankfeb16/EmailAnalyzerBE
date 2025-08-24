// // src/modules/email/email.module.ts
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// // import { EmailController } from './email.controller.ts';
// import { EmailController } from './email/email.controller';
// import { EmailService } from './email/email.service';
// import { Email, EmailSchema } from './email/schemas/email.schema';
// import { EspDetectorModule } from './esp-detector/esp-detector.module';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
//     EspDetectorModule,
//   ],
//   controllers: [EmailController],
//   providers: [EmailService],
//   exports: [EmailService],
// })
// export class EmailModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { EspDetectorService } from './esp-detector/esp-detector.service';
import { Email, EmailSchema } from './email/schemas/email.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EspDetectorService],
})
export class EmailModule {}
