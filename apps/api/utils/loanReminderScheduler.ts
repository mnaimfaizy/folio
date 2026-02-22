import { connectDatabase } from '../db/database';
import { emailService } from './emailService';

let schedulerStarted = false;

export function startLoanReminderScheduler(): void {
  if (schedulerStarted || process.env.NODE_ENV === 'test') {
    return;
  }

  schedulerStarted = true;

  const run = async () => {
    try {
      const db = await connectDatabase();
      const outcome = await emailService.processLoanReminderEmails(db);
      if (outcome.sentCount > 0 || outcome.checkedCount > 0) {
        console.log(
          `[loan-reminders] checked=${outcome.checkedCount} sent=${outcome.sentCount}`,
        );
      }
    } catch (error) {
      console.error('[loan-reminders] processing failed', error);
    }
  };

  setTimeout(run, 30 * 1000);
  setInterval(run, 24 * 60 * 60 * 1000);
}
