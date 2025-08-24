import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  from: string;

  @Prop()
  to: string;

  @Prop()
  messageId: string;

  @Prop({ type: Object, required: true })
  rawHeaders: Record<string, any>;

  @Prop({ type: [String] })
  receivingChain: string[];

  @Prop()
  espType: string;

  @Prop()
  espConfidence: number;

  @Prop({ type: [String] })
  espDetectionDetails: string[];

  @Prop({ type: Object })
  securityAnalysis: {
    spf: string;
    dkim: string;
    dmarc: string;
    encryption: string;
  };

  @Prop({ default: 'processed' })
  status: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
export type EmailDocument = Email & Document;
