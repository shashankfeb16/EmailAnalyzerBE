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

  @Get("test-info")
  getTestInfo() {
    return {
      title: "Email Analyzer Test Information",
      message: "Send POST request to /emails/process with email headers",
      endpoint: "POST /emails/process",
      samplePayload: {
        subject: "Test Email from Gmail",
        from: "sender@gmail.com",
        to: "receiver@example.com",
        messageId: "<test123@gmail.com>",
        headers: {
          received: [
            "from mail-wr1-f41.google.com (mail-wr1-f41.google.com [209.85.221.41]) by mx.google.com with ESMTPS",
            "from smtp.gmail.com ([209.85.128.20]) by mail-wr1-f41.google.com",
          ],
          "x-gm-message-state": "AOAM533...",
          "x-google-dkim-signature": "v=1; a=rsa-sha256...",
          "authentication-results":
            "mx.google.com; spf=pass; dkim=pass; dmarc=pass",
        },
      },
      availableEndpoints: [
        "GET /emails - List all emails",
        "GET /emails/:id - Get specific email",
        "GET /emails/esp/:espType - Filter by ESP",
        "GET /emails/analytics - Get statistics",
        "POST /emails/process - Process new email",
      ],
    };
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
