import nodemailer from 'nodemailer';
import config from '../config/config';
import type { DbClient } from '../db/types';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: config.email.host || 'mailhog',
      port: config.email.port || 1025,
      secure: false,
      // Only include auth if credentials are provided and not empty
      ...(config.email.user &&
        config.email.user !== '' && {
          auth: {
            user: config.email.user,
            pass: config.email.password,
          },
        }),
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.email.from,
        ...options,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        <p>Thank you for registering with our Library API. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #666;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; font-size: 12px; color: #777; text-align: center;">
          <p>© ${new Date().getFullYear()} Library API. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Email Verification - Library API',
      html,
    });
  }

  async processLoanReminderEmails(
    db: DbClient,
  ): Promise<{ checkedCount: number; sentCount: number }> {
    const activeLoans = await db.all<{
      id: number;
      due_date: string;
      status: string;
      user_email: string;
      user_name: string;
      book_title: string;
    }>(
      `SELECT l.id, l.due_date, l.status, u.email AS user_email, u.name AS user_name, b.title AS book_title
       FROM book_loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       WHERE l.status IN ('ACTIVE', 'OVERDUE')`,
    );

    let sentCount = 0;

    for (const loan of activeLoans) {
      const dueDate = new Date(loan.due_date);
      const now = new Date();
      const dueDay = new Date(
        Date.UTC(
          dueDate.getUTCFullYear(),
          dueDate.getUTCMonth(),
          dueDate.getUTCDate(),
        ),
      );
      const today = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );

      const daysDiff = Math.round(
        (dueDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
      );

      const notificationKeys: string[] = [];

      if (daysDiff === 2) {
        notificationKeys.push('pre_due_2');
      } else if (daysDiff === 0) {
        notificationKeys.push('due_day');
      } else if (daysDiff === -2) {
        notificationKeys.push('overdue_2');
      } else if (daysDiff < -2) {
        const overdueDays = Math.abs(daysDiff);
        if ((overdueDays - 2) % 7 === 0) {
          notificationKeys.push(
            `overdue_weekly_${Math.floor((overdueDays - 2) / 7)}`,
          );
        }
      }

      if (daysDiff < 0 && loan.status === 'ACTIVE') {
        await db.run(
          `UPDATE book_loans SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'ACTIVE'`,
          [loan.id],
        );
      }

      for (const key of notificationKeys) {
        const insertResult = await db.run(
          `INSERT INTO loan_notifications (loan_id, notification_key)
           VALUES (?, ?)
           ON CONFLICT (loan_id, notification_key) DO NOTHING`,
          [loan.id, key],
        );

        if (!insertResult.changes) {
          continue;
        }

        const messageLine =
          daysDiff > 0
            ? `Your borrowed book is due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}.`
            : daysDiff === 0
              ? 'Your borrowed book is due today.'
              : `Your borrowed book is overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}.`;

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
            <h2 style="margin: 0 0 12px 0; color: #111827;">Library Loan Reminder</h2>
            <p style="color: #374151;">Hello ${loan.user_name},</p>
            <p style="color: #374151;">${messageLine}</p>
            <p style="color: #111827;"><strong>Book:</strong> ${loan.book_title}</p>
            <p style="color: #111827;"><strong>Due Date:</strong> ${dueDate.toDateString()}</p>
            <p style="color: #6b7280; margin-top: 20px;">Please return your book as soon as possible or contact the library admin if the book is lost.</p>
          </div>
        `;

        const sent = await this.sendEmail({
          to: loan.user_email,
          subject: `Loan reminder: ${loan.book_title}`,
          html,
        });

        if (!sent) {
          await db.run(
            'DELETE FROM loan_notifications WHERE loan_id = ? AND notification_key = ?',
            [loan.id, key],
          );
          continue;
        }

        sentCount += 1;
      }
    }

    return {
      checkedCount: activeLoans.length,
      sentCount,
    };
  }
}

export const emailService = new EmailService();
