import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import { emailService } from '../utils/emailService';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    email?: string;
    role?: string;
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function getLoanSettings(
  db: Awaited<ReturnType<typeof connectDatabase>>,
) {
  const row = await db.get<{
    loans_enabled: boolean;
    max_concurrent_loans: number;
    default_loan_duration_days: number;
    minimum_credit_balance: number;
    credit_currency: string;
  }>(
    'SELECT loans_enabled, max_concurrent_loans, default_loan_duration_days, minimum_credit_balance, credit_currency FROM site_settings WHERE id = 1',
  );

  return {
    loansEnabled: row?.loans_enabled ?? true,
    maxConcurrentLoans: row?.max_concurrent_loans ?? 3,
    defaultLoanDurationDays: row?.default_loan_duration_days ?? 14,
    minimumCreditBalance: Number(row?.minimum_credit_balance ?? 50),
    creditCurrency: (row?.credit_currency ?? 'USD').toUpperCase(),
  };
}

function formatMoney(amount: number, currency: string): string {
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}

export const borrowBook = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);
    const bookId = toNumber(req.body?.bookId);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!bookId) {
      res.status(400).json({ message: 'bookId is required' });
      return;
    }

    const db = await connectDatabase();
    const settings = await getLoanSettings(db);

    if (!settings.loansEnabled) {
      res
        .status(403)
        .json({ message: 'Loan system is currently disabled by admin' });
      return;
    }

    const activeLoanCount = await db.get<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM book_loans
       WHERE user_id = ? AND status IN ('PENDING', 'ACTIVE', 'OVERDUE')`,
      [userId],
    );

    if ((activeLoanCount?.count ?? 0) >= settings.maxConcurrentLoans) {
      res.status(409).json({
        message: `You have reached the maximum of ${settings.maxConcurrentLoans} active loans`,
      });
      return;
    }

    const book = await db.get<{
      id: number;
      title: string;
      available_copies: number;
      price_amount: number;
    }>(
      'SELECT id, title, available_copies, price_amount FROM books WHERE id = ?',
      [bookId],
    );

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    if (!book.available_copies || book.available_copies <= 0) {
      res
        .status(409)
        .json({ message: 'Book is currently not available for loan' });
      return;
    }

    const bookPrice = Number(book.price_amount ?? 0);
    if (bookPrice <= 0) {
      res.status(409).json({
        message:
          'This book cannot be borrowed until a valid price is configured',
      });
      return;
    }

    const borrower = await db.get<{ id: number; credit_balance: number }>(
      'SELECT id, credit_balance FROM users WHERE id = ?',
      [userId],
    );

    if (!borrower) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const currentCredit = Number(borrower.credit_balance ?? 0);
    if (currentCredit < settings.minimumCreditBalance) {
      res.status(409).json({
        message: `Borrowing requires at least ${formatMoney(settings.minimumCreditBalance, settings.creditCurrency)} in your account`,
      });
      return;
    }

    if (currentCredit < bookPrice) {
      res.status(409).json({
        message: `Insufficient credit. Required ${formatMoney(bookPrice, settings.creditCurrency)}, available ${formatMoney(currentCredit, settings.creditCurrency)}`,
      });
      return;
    }

    const existingLoan = await db.get<{ id: number }>(
      `SELECT id FROM book_loans
       WHERE user_id = ? AND book_id = ? AND status IN ('PENDING', 'ACTIVE', 'OVERDUE')`,
      [userId, bookId],
    );

    if (existingLoan) {
      res.status(409).json({
        message: 'You already have a pending or active loan for this book',
      });
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.defaultLoanDurationDays);

    await db.run('BEGIN TRANSACTION');

    let loanInsert;
    try {
      loanInsert = await db.run(
        `INSERT INTO book_loans (user_id, book_id, borrowed_at, due_date, status, loan_credit_amount)
         VALUES (?, ?, CURRENT_TIMESTAMP, ?, 'PENDING', ?)`,
        [userId, bookId, dueDate.toISOString(), bookPrice],
      );

      await db.run(
        'UPDATE users SET credit_balance = credit_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookPrice, userId],
      );

      await db.run('COMMIT');
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }

    const loan = await db.get(
      `SELECT l.*, b.title AS book_title
       FROM book_loans l
       JOIN books b ON b.id = l.book_id
       WHERE l.id = ?`,
      [loanInsert.lastID],
    );

    res.status(201).json({
      message: 'Loan request submitted. Awaiting admin approval.',
      deductedAmount: bookPrice,
      creditCurrency: settings.creditCurrency,
      remainingCredit: Number(currentCredit - bookPrice),
      loan,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error borrowing book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const borrowBooksBatch = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);
    const rawBookIds = Array.isArray(req.body?.bookIds) ? req.body.bookIds : [];

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!rawBookIds.length) {
      res.status(400).json({ message: 'bookIds must be a non-empty array' });
      return;
    }

    const normalizedBookIds: number[] = [];
    for (const item of rawBookIds) {
      const parsed = toNumber(item);
      if (parsed) {
        normalizedBookIds.push(parsed);
      }
    }

    const bookIds = Array.from(new Set<number>(normalizedBookIds));

    if (!bookIds.length) {
      res.status(400).json({ message: 'bookIds contains no valid values' });
      return;
    }

    const db = await connectDatabase();
    const settings = await getLoanSettings(db);

    if (!settings.loansEnabled) {
      res
        .status(403)
        .json({ message: 'Loan system is currently disabled by admin' });
      return;
    }

    const borrower = await db.get<{ credit_balance: number }>(
      'SELECT credit_balance FROM users WHERE id = ?',
      [userId],
    );

    if (!borrower) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let currentCredit = Number(borrower.credit_balance ?? 0);
    if (currentCredit < settings.minimumCreditBalance) {
      res.status(409).json({
        message: `Borrowing requires at least ${formatMoney(settings.minimumCreditBalance, settings.creditCurrency)} in your account`,
      });
      return;
    }

    const activeLoanCountResult = await db.get<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM book_loans
       WHERE user_id = ? AND status IN ('PENDING', 'ACTIVE', 'OVERDUE')`,
      [userId],
    );

    let activeLoanCount = Number(activeLoanCountResult?.count ?? 0);

    const results: Array<{
      bookId: number;
      status: 'BORROWED' | 'FAILED';
      reason?: string;
      deductedAmount?: number;
      remainingCredit?: number;
      loanId?: number;
    }> = [];

    for (const bookId of bookIds) {
      if (activeLoanCount >= settings.maxConcurrentLoans) {
        results.push({
          bookId,
          status: 'FAILED',
          reason: `Maximum concurrent loans (${settings.maxConcurrentLoans}) reached`,
        });
        continue;
      }

      const book = await db.get<{
        id: number;
        title: string;
        available_copies: number;
        price_amount: number;
      }>(
        'SELECT id, title, available_copies, price_amount FROM books WHERE id = ?',
        [bookId],
      );

      if (!book) {
        results.push({ bookId, status: 'FAILED', reason: 'Book not found' });
        continue;
      }

      if (!book.available_copies || book.available_copies <= 0) {
        results.push({
          bookId,
          status: 'FAILED',
          reason: 'Book is currently not available for loan',
        });
        continue;
      }

      const bookPrice = Number(book.price_amount ?? 0);
      if (bookPrice <= 0) {
        results.push({
          bookId,
          status: 'FAILED',
          reason: 'Book price is not configured',
        });
        continue;
      }

      const existingLoan = await db.get<{ id: number }>(
        `SELECT id FROM book_loans
         WHERE user_id = ? AND book_id = ? AND status IN ('PENDING', 'ACTIVE', 'OVERDUE')`,
        [userId, bookId],
      );

      if (existingLoan) {
        results.push({
          bookId,
          status: 'FAILED',
          reason: 'You already have a pending or active loan for this book',
        });
        continue;
      }

      if (currentCredit < bookPrice) {
        results.push({
          bookId,
          status: 'FAILED',
          reason: `Insufficient credit. Required ${formatMoney(bookPrice, settings.creditCurrency)}, available ${formatMoney(currentCredit, settings.creditCurrency)}`,
        });
        continue;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + settings.defaultLoanDurationDays);

      await db.run('BEGIN TRANSACTION');
      try {
        const loanInsert = await db.run(
          `INSERT INTO book_loans (user_id, book_id, borrowed_at, due_date, status, loan_credit_amount)
           VALUES (?, ?, CURRENT_TIMESTAMP, ?, 'PENDING', ?)`,
          [userId, bookId, dueDate.toISOString(), bookPrice],
        );

        await db.run(
          'UPDATE users SET credit_balance = credit_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [bookPrice, userId],
        );

        await db.run('COMMIT');

        currentCredit -= bookPrice;
        activeLoanCount += 1;

        results.push({
          bookId,
          status: 'BORROWED',
          deductedAmount: bookPrice,
          remainingCredit: Number(currentCredit),
          loanId: Number(loanInsert.lastID),
        });
      } catch (transactionError) {
        await db.run('ROLLBACK');
        results.push({
          bookId,
          status: 'FAILED',
          reason: 'Failed to create loan request for this book',
        });
      }
    }

    const successCount = results.filter(
      (result) => result.status === 'BORROWED',
    ).length;
    const failedCount = results.length - successCount;
    const httpStatus = successCount > 0 ? 201 : 409;

    res.status(httpStatus).json({
      message:
        successCount > 0
          ? `Processed batch borrow request: ${successCount} succeeded, ${failedCount} failed`
          : 'No books could be borrowed from the batch request',
      successCount,
      failedCount,
      creditCurrency: settings.creditCurrency,
      remainingCredit: Number(currentCredit),
      results,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error borrowing books in batch:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const getMyLoans = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();

    const loans = await db.all(
      `SELECT l.*, b.title AS book_title, b.cover AS book_cover, b.author AS book_author
       FROM book_loans l
       JOIN books b ON b.id = l.book_id
       WHERE l.user_id = ?
       ORDER BY l.borrowed_at DESC`,
      [userId],
    );

    res.status(200).json({ loans });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user loans:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const returnLoan = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);
    const loanId = toNumber(req.params.loanId);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    const db = await connectDatabase();

    const loan = await db.get<{
      id: number;
      book_id: number;
      status: string;
      loan_credit_amount: number;
    }>(
      'SELECT id, book_id, status, loan_credit_amount FROM book_loans WHERE id = ? AND user_id = ?',
      [loanId, userId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (loan.status === 'RETURNED') {
      res.status(409).json({ message: 'Loan is already returned' });
      return;
    }

    if (loan.status === 'LOST') {
      res
        .status(409)
        .json({ message: 'Loan is marked as lost and cannot be returned' });
      return;
    }

    if (loan.status === 'PENDING') {
      res
        .status(409)
        .json({ message: 'Pending loan request cannot be returned' });
      return;
    }

    if (loan.status === 'REJECTED') {
      res
        .status(409)
        .json({ message: 'Rejected loan request cannot be returned' });
      return;
    }

    await db.run('BEGIN TRANSACTION');

    try {
      await db.run(
        `UPDATE book_loans
         SET status = 'RETURNED', returned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [loanId],
      );

      await db.run(
        'UPDATE books SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [loan.book_id],
      );

      const refundAmount = Number(loan.loan_credit_amount ?? 0);
      if (refundAmount > 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [refundAmount, userId],
        );
      }

      await db.run('COMMIT');

      res.status(200).json({ message: 'Loan returned successfully' });
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error returning loan:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const getAllLoansForAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const status =
      typeof req.query.status === 'string' ? req.query.status : null;
    const db = await connectDatabase();

    const params: unknown[] = [];
    const statusClause = status ? 'WHERE l.status = ?' : '';

    if (status) params.push(status);

    const loans = await db.all(
      `SELECT l.*, b.title AS book_title, b.author AS book_author, b.price_amount, u.name AS user_name, u.email AS user_email, u.credit_balance
       FROM book_loans l
       JOIN books b ON b.id = l.book_id
       JOIN users u ON u.id = l.user_id
       ${statusClause}
       ORDER BY l.borrowed_at DESC`,
      params,
    );

    res.status(200).json({ loans });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching all loans:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const markLoanAsLost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const loanId = toNumber(req.params.loanId);
    const note =
      typeof req.body?.note === 'string' ? req.body.note.trim() : null;

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    const db = await connectDatabase();
    const loan = await db.get<{
      id: number;
      user_id: number;
      status: string;
      loan_credit_amount: number;
      user_email: string;
      user_name: string;
      book_title: string;
      book_price: number;
      current_credit_balance: number;
    }>(
      `SELECT l.id, l.user_id, l.status, l.loan_credit_amount,
              u.email AS user_email, u.name AS user_name, u.credit_balance AS current_credit_balance,
              b.title AS book_title, b.price_amount AS book_price
       FROM book_loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       WHERE l.id = ?`,
      [loanId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (!['ACTIVE', 'OVERDUE'].includes(loan.status)) {
      res.status(409).json({
        message: 'Only active or overdue loans can be marked as lost',
      });
      return;
    }

    const bookPrice = Number(loan.book_price ?? 0);
    const existingReservedAmount = Number(loan.loan_credit_amount ?? 0);
    const additionalCharge = existingReservedAmount > 0 ? 0 : bookPrice;
    const chargeToRecord = bookPrice;

    if (
      additionalCharge > 0 &&
      Number(loan.current_credit_balance ?? 0) < additionalCharge
    ) {
      res.status(409).json({
        message:
          'User has insufficient credit balance to apply lost-book deduction',
      });
      return;
    }

    await db.run('BEGIN TRANSACTION');
    try {
      await db.run(
        `UPDATE book_loans
         SET status = 'LOST',
             lost_at = CURRENT_TIMESTAMP,
             penalty_amount = ?,
             admin_note = ?,
             loan_credit_amount = CASE WHEN loan_credit_amount > 0 THEN loan_credit_amount ELSE ? END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [chargeToRecord, note, chargeToRecord, loanId],
      );

      if (additionalCharge > 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [additionalCharge, loan.user_id],
        );
      }

      await db.run('COMMIT');
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }

    const refreshedUserCredit = await db.get<{ credit_balance: number }>(
      'SELECT credit_balance FROM users WHERE id = ?',
      [loan.user_id],
    );

    emailService
      .sendLoanMarkedLostEmail(
        loan.user_email,
        loan.user_name,
        loan.book_title,
        chargeToRecord,
        Number(
          refreshedUserCredit?.credit_balance ??
            loan.current_credit_balance ??
            0,
        ),
      )
      .catch((mailErr) =>
        console.error('Lost-loan notification failed unexpectedly:', mailErr),
      );

    res.status(200).json({ message: 'Loan marked as lost' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error marking loan as lost:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const processLoanRemindersNow = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();
    const outcome = await emailService.processLoanReminderEmails(db);
    res.status(200).json({ message: 'Loan reminders processed', ...outcome });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing reminders manually:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const approveLoanRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const loanId = toNumber(req.params.loanId);
    const adminUserId = toNumber(req.user?.id);

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();
    const settings = await getLoanSettings(db);

    const loan = await db.get<{
      id: number;
      user_id: number;
      book_id: number;
      status: string;
      loan_credit_amount: number;
    }>(
      'SELECT id, user_id, book_id, status, loan_credit_amount FROM book_loans WHERE id = ?',
      [loanId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan request not found' });
      return;
    }

    if (loan.status !== 'PENDING') {
      res
        .status(409)
        .json({ message: 'Only pending loan requests can be approved' });
      return;
    }

    const book = await db.get<{
      id: number;
      available_copies: number;
      price_amount: number;
    }>('SELECT id, available_copies, price_amount FROM books WHERE id = ?', [
      loan.book_id,
    ]);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    if (!book.available_copies || book.available_copies <= 0) {
      res
        .status(409)
        .json({ message: 'Book is currently not available for loan approval' });
      return;
    }

    const bookPrice = Number(book.price_amount ?? 0);
    if (bookPrice <= 0) {
      res.status(409).json({
        message:
          'This book cannot be approved until a valid price is configured',
      });
      return;
    }

    const activeLoanCount = await db.get<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM book_loans
       WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')`,
      [loan.user_id],
    );

    if ((activeLoanCount?.count ?? 0) >= settings.maxConcurrentLoans) {
      res.status(409).json({
        message: `User has reached the maximum of ${settings.maxConcurrentLoans} active loans`,
      });
      return;
    }

    if (Number(loan.loan_credit_amount ?? 0) <= 0) {
      const borrower = await db.get<{ credit_balance: number }>(
        'SELECT credit_balance FROM users WHERE id = ?',
        [loan.user_id],
      );

      const currentCredit = Number(borrower?.credit_balance ?? 0);
      if (currentCredit < settings.minimumCreditBalance) {
        res.status(409).json({
          message: `Borrower must have at least ${formatMoney(settings.minimumCreditBalance, settings.creditCurrency)} credit before approval`,
        });
        return;
      }

      if (currentCredit < bookPrice) {
        res.status(409).json({
          message: `Insufficient borrower credit for approval. Required ${formatMoney(bookPrice, settings.creditCurrency)}, available ${formatMoney(currentCredit, settings.creditCurrency)}`,
        });
        return;
      }
    }

    await db.run('BEGIN TRANSACTION');

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + settings.defaultLoanDurationDays);

      await db.run(
        `UPDATE book_loans
         SET status = 'ACTIVE',
             approved_at = CURRENT_TIMESTAMP,
             due_date = ?,
             loan_credit_amount = CASE WHEN loan_credit_amount > 0 THEN loan_credit_amount ELSE ? END,
             reviewed_by_user_id = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [dueDate.toISOString(), bookPrice, adminUserId, loanId],
      );

      if (Number(loan.loan_credit_amount ?? 0) <= 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [bookPrice, loan.user_id],
        );
      }

      await db.run(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [loan.book_id],
      );

      await db.run('COMMIT');
      res.status(200).json({ message: 'Loan request approved successfully' });
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error approving loan request:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const adminCreateLoan = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const adminUserId = toNumber(req.user?.id);
    const userId = toNumber(req.body?.userId);
    const bookId = toNumber(req.body?.bookId);
    const dueDateRaw =
      typeof req.body?.dueDate === 'string' ? req.body.dueDate.trim() : null;

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    if (!bookId) {
      res.status(400).json({ message: 'bookId is required' });
      return;
    }

    if (!dueDateRaw) {
      res.status(400).json({ message: 'dueDate is required' });
      return;
    }

    const parsedDueDate = new Date(dueDateRaw);
    if (Number.isNaN(parsedDueDate.getTime())) {
      res.status(400).json({ message: 'dueDate must be a valid ISO date' });
      return;
    }

    if (parsedDueDate <= new Date()) {
      res.status(400).json({ message: 'dueDate must be in the future' });
      return;
    }

    const db = await connectDatabase();

    const targetUser = await db.get<{
      id: number;
      name: string;
      email: string;
      credit_balance: number;
    }>('SELECT id, name, email, credit_balance FROM users WHERE id = ?', [
      userId,
    ]);

    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const book = await db.get<{
      id: number;
      title: string;
      available_copies: number;
      price_amount: number;
    }>(
      'SELECT id, title, available_copies, price_amount FROM books WHERE id = ?',
      [bookId],
    );

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    if (!book.available_copies || book.available_copies <= 0) {
      res
        .status(409)
        .json({ message: 'Book is currently not available for loan' });
      return;
    }

    const bookPrice = Number(book.price_amount ?? 0);
    if (bookPrice <= 0) {
      res.status(409).json({
        message:
          'This book cannot be borrowed until a valid price is configured',
      });
      return;
    }

    const settings = await getLoanSettings(db);

    const currentCredit = Number(targetUser.credit_balance ?? 0);
    if (currentCredit < settings.minimumCreditBalance) {
      res.status(409).json({
        message: `User must have at least ${formatMoney(settings.minimumCreditBalance, settings.creditCurrency)} credit before borrowing`,
      });
      return;
    }

    if (currentCredit < bookPrice) {
      res.status(409).json({
        message: `Insufficient credit. Required ${formatMoney(bookPrice, settings.creditCurrency)}, available ${formatMoney(currentCredit, settings.creditCurrency)}`,
      });
      return;
    }

    const activeLoanCount = await db.get<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM book_loans
       WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')`,
      [userId],
    );

    if ((activeLoanCount?.count ?? 0) >= settings.maxConcurrentLoans) {
      res.status(409).json({
        message: `User has reached the maximum of ${settings.maxConcurrentLoans} active loans`,
      });
      return;
    }

    const existingActiveLoan = await db.get<{ id: number }>(
      `SELECT id FROM book_loans
       WHERE user_id = ? AND book_id = ? AND status IN ('PENDING', 'ACTIVE', 'OVERDUE')`,
      [userId, bookId],
    );

    if (existingActiveLoan) {
      res
        .status(409)
        .json({ message: 'User already has an active loan for this book' });
      return;
    }

    await db.run('BEGIN TRANSACTION');

    try {
      const newLoan = await db.get<{ id: number }>(
        `INSERT INTO book_loans
           (user_id, book_id, status, borrowed_at, due_date, approved_at, reviewed_by_user_id, loan_credit_amount, created_at, updated_at)
         VALUES (?, ?, 'ACTIVE', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [userId, bookId, parsedDueDate.toISOString(), adminUserId, bookPrice],
      );

      await db.run(
        'UPDATE users SET credit_balance = credit_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookPrice, userId],
      );

      await db.run(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookId],
      );

      await db.run('COMMIT');

      // Send confirmation email (non-blocking)
      emailService
        .sendLoanCreatedByAdminEmail(
          targetUser.email,
          targetUser.name,
          book.title,
          parsedDueDate,
          {
            creditCurrency: settings.creditCurrency,
            bookPriceAmount: bookPrice,
            updatedCreditBalance: currentCredit - bookPrice,
          },
        )
        .then((sent) => {
          if (sent)
            console.log(`Loan-created email sent to ${targetUser.email}`);
          else
            console.error(
              `Loan-created email failed to send to ${targetUser.email}`,
            );
        })
        .catch((err) =>
          console.error('Loan-created email threw unexpectedly:', err),
        );

      res.status(201).json({
        message: 'Loan created successfully',
        loanId: newLoan?.id,
      });
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating loan as admin:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const adminDeleteLoan = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const loanId = toNumber(req.params.loanId);
    const adminUserId = toNumber(req.user?.id);

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();

    const loan = await db.get<{
      id: number;
      user_id: number;
      book_id: number;
      status: string;
      loan_credit_amount: number;
      due_date: string;
      user_name: string;
      user_email: string;
      book_title: string;
    }>(
      `SELECT l.id, l.user_id, l.book_id, l.status, l.loan_credit_amount, l.due_date,
              u.name AS user_name, u.email AS user_email,
              b.title AS book_title
       FROM book_loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       WHERE l.id = ?`,
      [loanId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    // Restore available_copies only when the book is currently checked out
    const restoreCopy = loan.status === 'ACTIVE' || loan.status === 'OVERDUE';
    const shouldRefundCredit = ['PENDING', 'ACTIVE', 'OVERDUE'].includes(
      loan.status,
    );

    await db.run('BEGIN TRANSACTION');

    try {
      await db.run('DELETE FROM book_loans WHERE id = ?', [loanId]);

      if (restoreCopy) {
        await db.run(
          'UPDATE books SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [loan.book_id],
        );
      }

      const refundAmount = Number(loan.loan_credit_amount ?? 0);
      if (shouldRefundCredit && refundAmount > 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [refundAmount, loan.user_id],
        );
      }

      await db.run('COMMIT');
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }

    // Send deletion notification email (non-blocking)
    emailService
      .sendLoanDeletedByAdminEmail(
        loan.user_email,
        loan.user_name,
        loan.book_title,
      )
      .then((sent) => {
        if (sent) console.log(`Loan-deleted email sent to ${loan.user_email}`);
        else
          console.error(
            `Loan-deleted email failed to send to ${loan.user_email}`,
          );
      })
      .catch((err) =>
        console.error('Loan-deleted email threw unexpectedly:', err),
      );

    res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting loan:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const adminMarkLoanReturned = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const loanId = toNumber(req.params.loanId);
    const adminUserId = toNumber(req.user?.id);
    const returnDateRaw =
      typeof req.body?.returnDate === 'string'
        ? req.body.returnDate.trim()
        : null;

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    let returnDate: Date;
    if (returnDateRaw) {
      returnDate = new Date(returnDateRaw);
      if (Number.isNaN(returnDate.getTime())) {
        res
          .status(400)
          .json({ message: 'returnDate must be a valid ISO date' });
        return;
      }
    } else {
      returnDate = new Date();
    }

    const db = await connectDatabase();

    const loan = await db.get<{
      id: number;
      user_id: number;
      book_id: number;
      status: string;
      loan_credit_amount: number;
      user_name: string;
      user_email: string;
      book_title: string;
    }>(
      `SELECT l.id, l.user_id, l.book_id, l.status, l.loan_credit_amount,
              u.name AS user_name, u.email AS user_email,
              b.title AS book_title
       FROM book_loans l
       JOIN users u ON u.id = l.user_id
       JOIN books b ON b.id = l.book_id
       WHERE l.id = ?`,
      [loanId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    if (!['ACTIVE', 'OVERDUE'].includes(loan.status)) {
      res.status(409).json({
        message: 'Only active or overdue loans can be marked as returned',
      });
      return;
    }

    await db.run('BEGIN TRANSACTION');

    try {
      await db.run(
        `UPDATE book_loans
         SET status = 'RETURNED',
             returned_at = ?,
             reviewed_by_user_id = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [returnDate.toISOString(), adminUserId, loanId],
      );

      await db.run(
        'UPDATE books SET available_copies = available_copies + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [loan.book_id],
      );

      const refundAmount = Number(loan.loan_credit_amount ?? 0);
      if (refundAmount > 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [refundAmount, loan.user_id],
        );
      }

      await db.run('COMMIT');
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }

    // Send return confirmation email (non-blocking)
    const userCredit = await db.get<{ credit_balance: number }>(
      'SELECT credit_balance FROM users WHERE id = ?',
      [loan.user_id],
    );

    emailService
      .sendLoanReturnedByAdminEmail(
        loan.user_email,
        loan.user_name,
        loan.book_title,
        returnDate,
        {
          refundedAmount: Number(loan.loan_credit_amount ?? 0),
          updatedCreditBalance: Number(userCredit?.credit_balance ?? 0),
        },
      )
      .then((sent) => {
        if (sent) console.log(`Loan-returned email sent to ${loan.user_email}`);
        else
          console.error(
            `Loan-returned email failed to send to ${loan.user_email}`,
          );
      })
      .catch((err) =>
        console.error('Loan-returned email threw unexpectedly:', err),
      );

    res
      .status(200)
      .json({ message: 'Loan marked as returned and user notified' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error marking loan as returned (admin):', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const rejectLoanRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const loanId = toNumber(req.params.loanId);
    const adminUserId = toNumber(req.user?.id);
    const reason =
      typeof req.body?.reason === 'string' ? req.body.reason.trim() : null;

    if (!loanId) {
      res.status(400).json({ message: 'Invalid loan id' });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();
    const loan = await db.get<{
      id: number;
      status: string;
      user_id: number;
      loan_credit_amount: number;
    }>(
      'SELECT id, status, user_id, loan_credit_amount FROM book_loans WHERE id = ?',
      [loanId],
    );

    if (!loan) {
      res.status(404).json({ message: 'Loan request not found' });
      return;
    }

    if (loan.status !== 'PENDING') {
      res
        .status(409)
        .json({ message: 'Only pending loan requests can be rejected' });
      return;
    }

    await db.run('BEGIN TRANSACTION');
    try {
      await db.run(
        `UPDATE book_loans
         SET status = 'REJECTED',
             rejected_at = CURRENT_TIMESTAMP,
             reviewed_by_user_id = ?,
             rejection_reason = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [adminUserId, reason, loanId],
      );

      const refundAmount = Number(loan.loan_credit_amount ?? 0);
      if (refundAmount > 0) {
        await db.run(
          'UPDATE users SET credit_balance = credit_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [refundAmount, loan.user_id],
        );
      }

      await db.run('COMMIT');
    } catch (transactionError) {
      await db.run('ROLLBACK');
      throw transactionError;
    }

    res.status(200).json({ message: 'Loan request rejected successfully' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rejecting loan request:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
