import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("emails")
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get()
  async getAllEmails() {
    try {
      return await this.emailService.getAllEmails();
    } catch (error) {
      throw new HttpException(
        "Failed to fetch emails",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("analytics")
  async getAnalytics() {
    try {
      return await this.emailService.getAnalytics();
    } catch (error) {
      throw new HttpException(
        "Failed to fetch analytics",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("esp/:espType")
  async getEmailsByEsp(@Param("espType") espType: string) {
    try {
      return await this.emailService.getEmailsByEsp(espType);
    } catch (error) {
      throw new HttpException(
        "Failed to fetch emails by ESP",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get(":id")
  async getEmailById(@Param("id") id: string) {
    try {
      const email = await this.emailService.getEmailById(id);
      if (!email) {
        throw new HttpException("Email not found", HttpStatus.NOT_FOUND);
      }
      return email;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Failed to fetch email",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("process")
  async processEmail(@Body() emailData: any) {
    try {
      // Basic validation
      if (!emailData.subject || !emailData.from || !emailData.headers) {
        throw new HttpException(
          "Missing required fields: subject, from, headers",
          HttpStatus.BAD_REQUEST,
        );
      }

      const processedEmail = await this.emailService.processEmail(emailData);

      return {
        success: true,
        message: "Email processed successfully",
        data: processedEmail,
        summary: {
          esp: processedEmail.espType,
          confidence: `${(processedEmail.espConfidence * 100).toFixed(1)}%`,
          receivingChainLength: processedEmail.receivingChain.length,
          securityPassed: [
            processedEmail.securityAnalysis.spf === "PASS" ? "SPF" : null,
            processedEmail.securityAnalysis.dkim === "PASS" ? "DKIM" : null,
            processedEmail.securityAnalysis.dmarc === "PASS" ? "DMARC" : null,
          ].filter(Boolean),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Failed to process email: " + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
