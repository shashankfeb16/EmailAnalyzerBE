import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailModule } from "./modules/email.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      "mongodb+srv://shashankfeb16:4uZVR6h5W5epEpTh@cluster0.gsmbg0k.mongodb.net/",
    ),
    EmailModule,
  ],
})
export class AppModule {}
