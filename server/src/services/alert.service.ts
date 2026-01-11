import sendgrid from '@sendgrid/mail';
import Alert from '../models/Alert';
import Analysis from '../models/Analysis';
import Youth from '../models/Youth';
import User from '../models/User';
import logger from '../utils/logger';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'alerts@safemind.app';

if (SENDGRID_API_KEY) {
  sendgrid.setApiKey(SENDGRID_API_KEY);
}

class AlertService {
  async createAlert(analysis: Analysis, youth: Youth, guardianId: string): Promise<Alert> {
    try {
      const severity = this.determineSeverity(analysis);
      const message = this.generateAlertMessage(analysis, youth);

      const alert = await Alert.create({
        analysisId: analysis.id,
        youthId: youth.id,
        guardianId,
        severity,
        message,
      });

      await this.sendEmailNotification(alert, youth, guardianId);

      logger.info(`Alert created: ${alert.id} for youth: ${youth.id}`);

      return alert;
    } catch (error) {
      logger.error('Failed to create alert:', error);
      throw error;
    }
  }

  private determineSeverity(analysis: Analysis): 'low' | 'medium' | 'high' | 'critical' {
    if (analysis.threatScore > 0.8 || analysis.severeToxicityScore > 0.85) {
      return 'critical';
    } else if (analysis.threatScore > 0.7 || analysis.riskLevel === 'high') {
      return 'high';
    } else if (analysis.riskLevel === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private generateAlertMessage(analysis: Analysis, youth: Youth): string {
    const categories = analysis.categoriesExceeded.join(', ');
    return `Harmful content detected for ${youth.firstName} ${youth.lastName}. Categories: ${categories}. Risk level: ${analysis.riskLevel}.`;
  }

  private async sendEmailNotification(alert: Alert, youth: Youth, guardianId: string): Promise<void> {
    try {
      if (!SENDGRID_API_KEY) {
        logger.warn('SendGrid API key not configured, skipping email notification');
        return;
      }

      const guardian = await User.findByPk(guardianId);
      if (!guardian) {
        logger.error('Guardian not found for email notification');
        return;
      }

      const msg = {
        to: guardian.email,
        from: SENDGRID_FROM_EMAIL,
        subject: `[SafeMind Alert] ${alert.severity.toUpperCase()} - Action Required`,
        text: alert.message,
        html: this.generateEmailHTML(alert, youth, guardian),
      };

      await sendgrid.send(msg);
      logger.info(`Email notification sent to ${guardian.email}`);
    } catch (error) {
      logger.error('Failed to send email notification:', error);
    }
  }

  private generateEmailHTML(alert: Alert, youth: Youth, guardian: User): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .alert-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }
          .severity { font-weight: bold; text-transform: uppercase; }
          .critical { color: #d32f2f; }
          .high { color: #f57c00; }
          .medium { color: #fbc02d; }
          .button { display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SafeMind Alert</h1>
          </div>
          <div class="content">
            <p>Hello ${guardian.firstName},</p>
            <div class="alert-box">
              <p><span class="severity ${alert.severity}">${alert.severity} Severity Alert</span></p>
              <p>${alert.message}</p>
              <p><strong>Youth:</strong> ${youth.firstName} ${youth.lastName}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please review this alert and take appropriate action.</p>
            <a href="${process.env.CORS_ORIGIN}/alerts/${alert.id}" class="button">View Alert Details</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const alertService = new AlertService();
