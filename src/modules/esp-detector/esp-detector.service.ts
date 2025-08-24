import { Injectable } from '@nestjs/common';

interface ESPPattern {
  name: string;
  patterns: string[];
  headerChecks: string[];
  confidence: number;
}

@Injectable()
export class EspDetectorService {
  private readonly espPatterns: ESPPattern[] = [
    {
      name: 'Gmail',
      patterns: [
        'mail.gmail.com',
        'gmail-smtp-in.l.google.com',
        'smtp.gmail.com',
        'googlemail.com',
        'mx.google.com',
      ],
      headerChecks: ['x-gm-message-state', 'x-google-dkim-signature'],
      confidence: 0.95,
    },
    {
      name: 'Outlook/Microsoft',
      patterns: [
        'outlook.com',
        'hotmail.com',
        'live.com',
        'smtp-mail.outlook.com',
        'protection.outlook.com',
        'smtp.live.com',
      ],
      headerChecks: ['x-ms-exchange', 'x-microsoft-antispam'],
      confidence: 0.9,
    },
    {
      name: 'Amazon SES',
      patterns: [
        'amazonses.com',
        'email.amazonses.com',
        'ses-smtp-prod',
        'email-smtp.us-east-1.amazonses.com',
      ],
      headerChecks: ['x-ses-receipt', 'x-amzn-ses'],
      confidence: 0.98,
    },
    {
      name: 'SendGrid',
      patterns: ['sendgrid.net', 'sendgrid.com', 'smtp.sendgrid.net'],
      headerChecks: ['x-sg-eid', 'x-sendgrid'],
      confidence: 0.95,
    },
    {
      name: 'Mailgun',
      patterns: ['mailgun.org', 'mailgun.net', 'smtp.mailgun.org'],
      headerChecks: ['x-mailgun', 'x-mg-message-id'],
      confidence: 0.95,
    },
    {
      name: 'Zoho',
      patterns: ['zoho.com', 'smtp.zoho.com', 'zohomail.com', 'mx.zoho.com'],
      headerChecks: ['x-zoho-virus', 'x-zohomailclient'],
      confidence: 0.9,
    },
    {
      name: 'Yahoo',
      patterns: ['yahoo.com', 'yahoomail.com', 'smtp.mail.yahoo.com'],
      headerChecks: ['x-yahoo', 'x-originating-ip'],
      confidence: 0.85,
    },
  ];

  detectESP(headers: any): {
    esp: string;
    confidence: number;
    details: string[];
  } {
    const headerStr = JSON.stringify(headers).toLowerCase();
    const detectionDetails: string[] = [];

    for (const espPattern of this.espPatterns) {
      let matchCount = 0;
      const totalChecks =
        espPattern.patterns.length + espPattern.headerChecks.length;

      for (const pattern of espPattern.patterns) {
        if (headerStr.includes(pattern.toLowerCase())) {
          matchCount++;
          detectionDetails.push(`Found pattern: ${pattern}`);
        }
      }

      for (const headerCheck of espPattern.headerChecks) {
        if (headerStr.includes(headerCheck.toLowerCase())) {
          matchCount += 2;
          detectionDetails.push(`Found header: ${headerCheck}`);
        }
      }

      const matchRatio = matchCount / totalChecks;
      if (matchRatio > 0.3) {
        return {
          esp: espPattern.name,
          confidence: Math.min(espPattern.confidence * matchRatio, 1.0),
          details: detectionDetails,
        };
      }
    }

    return {
      esp: 'Unknown',
      confidence: 0,
      details: ['No ESP patterns matched'],
    };
  }

  extractReceivingChain(headers: any): string[] {
    const receivedHeaders = headers.received || [];
    const chain: string[] = [];

    if (Array.isArray(receivedHeaders)) {
      receivedHeaders.forEach((header, index) => {
        const fromMatch = header.match(/from\s+([^\s\(\[\]]+)/i);
        if (fromMatch && fromMatch[1]) {
          chain.push(`${index + 1}. ${fromMatch[1]}`);
        }
      });
    } else if (typeof receivedHeaders === 'string') {
      const fromMatch = receivedHeaders.match(/from\s+([^\s\(\[\]]+)/i);
      if (fromMatch && fromMatch[1]) {
        chain.push(`1. ${fromMatch[1]}`);
      }
    }

    return chain.length > 0 ? chain : ['No receiving chain found'];
  }

  analyzeEmailSecurity(headers: any): {
    spf: string;
    dkim: string;
    dmarc: string;
    encryption: string;
  } {
    const headerStr = JSON.stringify(headers).toLowerCase();

    return {
      spf: headerStr.includes('spf=pass')
        ? 'PASS'
        : headerStr.includes('spf=fail')
          ? 'FAIL'
          : 'UNKNOWN',
      dkim: headerStr.includes('dkim=pass')
        ? 'PASS'
        : headerStr.includes('dkim=fail')
          ? 'FAIL'
          : 'UNKNOWN',
      dmarc: headerStr.includes('dmarc=pass')
        ? 'PASS'
        : headerStr.includes('dmarc=fail')
          ? 'FAIL'
          : 'UNKNOWN',
      encryption:
        headerStr.includes('tls') || headerStr.includes('ssl') ? 'YES' : 'NO',
    };
  }
}
