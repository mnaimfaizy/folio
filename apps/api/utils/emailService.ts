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

  async sendLoanCreatedByAdminEmail(
    userEmail: string,
    userName: string,
    bookTitle: string,
    dueDate: Date,
    options?: {
      creditCurrency?: string;
      bookPriceAmount?: number;
      updatedCreditBalance?: number;
    },
  ): Promise<boolean> {
    const dueDateStr = dueDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1d4ed8; padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">📚 New Book Loan</h1>
        </div>
        <div style="padding: 28px 32px;">
          <p style="color: #374151; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151;">A library loan has been created for you by an administrator. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 40%;">Book</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${bookTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Status</td>
              <td style="padding: 12px 16px;"><span style="background-color: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600;">Active</span></td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Return by</td>
              <td style="padding: 12px 16px; color: #b91c1c; font-weight: 700; font-size: 14px;">${dueDateStr}</td>
            </tr>
            ${typeof options?.bookPriceAmount === 'number' ? `<tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Book price</td><td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${(options.creditCurrency || 'USD').toUpperCase()} ${options.bookPriceAmount.toFixed(2)}</td></tr>` : ''}
            ${typeof options?.updatedCreditBalance === 'number' ? `<tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Remaining credit</td><td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${(options.creditCurrency || 'USD').toUpperCase()} ${options.updatedCreditBalance.toFixed(2)}</td></tr>` : ''}
          </table>

          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px 16px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #9a3412; font-size: 14px;">
              <strong>Important:</strong> Please return the book by <strong>${dueDateStr}</strong>.
              If the book is not returned on time, you will receive periodic reminder emails after the deadline until the book is returned.
              Continued non-compliance may result in a penalty charge.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            If you have any questions, please contact the library administration.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Library System. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Your loan is active: "${bookTitle}" — due ${dueDateStr}`,
      html,
    });
  }

  async sendLoanReturnedByAdminEmail(
    userEmail: string,
    userName: string,
    bookTitle: string,
    returnDate: Date,
    options?: {
      creditCurrency?: string;
      refundedAmount?: number;
      updatedCreditBalance?: number;
    },
  ): Promise<boolean> {
    const returnDateStr = returnDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">&#x2705; Book Returned — Thank You!</h1>
        </div>
        <div style="padding: 28px 32px;">
          <p style="color: #374151; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151;">
            We're pleased to let you know that your loan for <strong>"${bookTitle}"</strong> has been
            marked as returned by an administrator on <strong>${returnDateStr}</strong>.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 40%;">Book</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${bookTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Return Date</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${returnDateStr}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Status</td>
              <td style="padding: 12px 16px;"><span style="background-color: #f3f4f6; color: #374151; padding: 2px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600;">Returned</span></td>
            </tr>
            ${typeof options?.refundedAmount === 'number' ? `<tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Credit refunded</td><td style="padding: 12px 16px; color: #166534; font-weight: 700; font-size: 14px;">${(options.creditCurrency || 'USD').toUpperCase()} ${options.refundedAmount.toFixed(2)}</td></tr>` : ''}
            ${typeof options?.updatedCreditBalance === 'number' ? `<tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Current credit</td><td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${(options.creditCurrency || 'USD').toUpperCase()} ${options.updatedCreditBalance.toFixed(2)}</td></tr>` : ''}
          </table>

          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
              &#x1F4DA; <strong>Thank you</strong> for using the library and for returning the book on time.
              Your promptness and care help ensure that other members can enjoy the collection too.
              We truly appreciate your support of the library — we hope to see you again soon!
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            No further action is required from you. If you have any questions or concerns, please don't hesitate to contact the library administration.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Library System. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `"${bookTitle}" has been marked as returned — Thank you!`,
      html,
    });
  }

  async sendLoanDeletedByAdminEmail(
    userEmail: string,
    userName: string,
    bookTitle: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc2626; padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">&#x1F4DA; Loan Cancelled</h1>
        </div>
        <div style="padding: 28px 32px;">
          <p style="color: #374151; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151;">An administrator has cancelled your book loan. The following loan has been removed from your account:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 40%;">Book</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${bookTitle}</td>
            </tr>
          </table>

          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you believe this was done in error or have questions, please contact the library administration.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Library System. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Your loan for "${bookTitle}" has been cancelled`,
      html,
    });
  }

  async sendCreditTopUpNotificationEmail(
    userEmail: string,
    userName: string,
    creditedAmount: number,
    currentBalance: number,
    creditedAt: Date,
    currency = 'USD',
  ): Promise<boolean> {
    const creditedAtStr = creditedAt.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f766e; padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">Credit Added to Your Account</h1>
        </div>
        <div style="padding: 28px 32px;">
          <p style="color: #374151; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151;">An administrator has credited your library account.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 40%;">Credited amount</td>
              <td style="padding: 12px 16px; color: #166534; font-weight: 700; font-size: 14px;">${currency.toUpperCase()} ${creditedAmount.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Current balance</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${currency.toUpperCase()} ${currentBalance.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Credited at</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${creditedAtStr}</td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Library System. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Account credit added: ${currency.toUpperCase()} ${creditedAmount.toFixed(2)}`,
      html,
    });
  }

  async sendLoanMarkedLostEmail(
    userEmail: string,
    userName: string,
    bookTitle: string,
    chargeAmount: number,
    currentBalance: number,
    currency = 'USD',
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #b91c1c; padding: 24px 32px;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px;">Loan Marked as Lost</h1>
        </div>
        <div style="padding: 28px 32px;">
          <p style="color: #374151; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151;">Your loan has been marked as lost by the library administrator.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 40%;">Book</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${bookTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Charged amount</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 700; font-size: 14px;">${currency.toUpperCase()} ${chargeAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 14px;">Current credit balance</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600; font-size: 14px;">${currency.toUpperCase()} ${currentBalance.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Library System. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Lost loan charge applied: ${bookTitle}`,
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
