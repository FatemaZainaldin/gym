import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST ?? 'localhost',
        port: Number(process.env.MAIL_PORT ?? 1025),
        ignoreTLS: true,          // MailHog doesn't need TLS
      },
      defaults: {
        from: '"Badan" <no-reply@badan.app>',
      },
      template: {
        dir: join(process.cwd(), 'src', 'mail', 'templates'),  // ← process.cwd() not __dirname
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
