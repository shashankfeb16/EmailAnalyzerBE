import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schema';
import { EspDetectorService } from '../esp-detector/esp-detector.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
    private espDetector: EspDetectorService,
  ) {}

  async processEmail(emailData: any) {
    console.log('📧 Processing email:', emailData.subject);

    // Enhanced ESP detection
    const espResult = this.espDetector.detectESP(emailData.headers);
    const receivingChain = this.espDetector.extractReceivingChain(
      emailData.headers,
    );
    const securityAnalysis = this.espDetector.analyzeEmailSecurity(
      emailData.headers,
    );

    const email = new this.emailModel({
      subject: emailData.subject,
      from: emailData.from,
      to: emailData.to || 'Not specified',
      messageId: emailData.messageId || `generated-${Date.now()}`,
      rawHeaders: emailData.headers,
      receivingChain,
      espType: espResult.esp,
      espConfidence: espResult.confidence,
      espDetectionDetails: espResult.details,
      securityAnalysis,
    });

    const savedEmail = await email.save();
    console.log(
      `✅ Email processed - ESP: ${espResult.esp} (${(espResult.confidence * 100).toFixed(1)}%)`,
    );

    return savedEmail;
  }

  async getAllEmails() {
    return this.emailModel
      .find()
      .sort({ createdAt: -1 })
      .select('-rawHeaders') // Exclude heavy raw headers from list view
      .exec();
  }

  async getEmailById(id: string) {
    return this.emailModel.findById(id).exec();
  }

  async getEmailsByEsp(esp: string) {
    return this.emailModel
      .find({ espType: { $regex: esp, $options: 'i' } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAnalytics() {
    const totalEmails = await this.emailModel.countDocuments();

    const espStats = await this.emailModel.aggregate([
      { $group: { _id: '$espType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentEmails = await this.emailModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject from espType createdAt')
      .exec();

    return {
      totalEmails,
      espBreakdown: espStats,
      recentEmails,
    };
  }
}
