import { connectDatabase } from '../db/database';
import { SiteSettings } from '../models/SiteSettings';

const SETTINGS_ROW_ID = 1;

export const getSettingsRow = async (): Promise<SiteSettings | undefined> => {
  const db = await connectDatabase();
  return db.get<SiteSettings>('SELECT * FROM site_settings WHERE id = ?', [
    SETTINGS_ROW_ID,
  ]);
};

export const ensureSettingsRow = async (): Promise<
  SiteSettings | undefined
> => {
  const db = await connectDatabase();

  let row = await db.get<SiteSettings>(
    'SELECT * FROM site_settings WHERE id = ?',
    [SETTINGS_ROW_ID],
  );

  if (!row) {
    await db.run('INSERT INTO site_settings (id) VALUES (?)', [
      SETTINGS_ROW_ID,
    ]);
    row = await db.get<SiteSettings>(
      'SELECT * FROM site_settings WHERE id = ?',
      [SETTINGS_ROW_ID],
    );
  }

  return row;
};

export const updateSettingsRow = async (
  setClauses: string[],
  values: unknown[],
): Promise<void> => {
  const db = await connectDatabase();
  const sql = `UPDATE site_settings SET ${setClauses.join(', ')} WHERE id = ?`;

  await db.run(sql, [...values, SETTINGS_ROW_ID]);
};
