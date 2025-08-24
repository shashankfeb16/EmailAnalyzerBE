import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailController } from "./email/email.controller";
import { EmailService } from "./email/email.service";
import { EspDetectorService } from "./esp-detector/esp-detector.service";
import { Email, EmailSchema } from "./email/schemas/email.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EspDetectorService],
})
export class EmailModule {}
