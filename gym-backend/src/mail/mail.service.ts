import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendTenantWelcome(payload: {
    email: string;
    name: string;
    tempPassword: string;
    loginUrl: string;
  }) {
    await this.mailer.sendMail({
      to: payload.email,
      subject: 'Welcome to Badan — Your Account is Ready',
      template: 'welcome',           // → templates/welcome.hbs
      context: {
        name:         payload.name,
        email:        payload.email,
        tempPassword: payload.tempPassword,
        loginUrl:     payload.loginUrl,
      },
    });
  }
}