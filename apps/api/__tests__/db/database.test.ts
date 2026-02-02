const mockPoolQuery = jest.fn();
const mockPoolConnect = jest.fn();
const mockClientQuery = jest.fn();
const mockClientRelease = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockPoolQuery,
    connect: mockPoolConnect,
  })),
}));

describe('Database Module (Postgres adapter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPoolQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockPoolConnect.mockResolvedValue({
      query: mockClientQuery,
      release: mockClientRelease,
    });
  });

  it('initializes schema on first connect', async () => {
    jest.resetModules();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { connectDatabase } = await import('../../db/database');
    await connectDatabase();

    expect(
      mockPoolQuery.mock.calls.some((call) =>
        String(call[0]).includes('CREATE TABLE IF NOT EXISTS users'),
      ),
    ).toBe(true);

    expect(consoleSpy).toHaveBeenCalledWith('Connected to Postgres database');
    consoleSpy.mockRestore();
  });

  it('converts SQLite-style ? placeholders to $n', async () => {
    jest.resetModules();
    const { connectDatabase } = await import('../../db/database');
    const db = await connectDatabase();

    await db.get('SELECT * FROM users WHERE id = ?', [1]);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1],
    );
  });

  it('rewrites INSERT OR IGNORE to ON CONFLICT DO NOTHING', async () => {
    jest.resetModules();
    const { connectDatabase } = await import('../../db/database');
    const db = await connectDatabase();

    await db.run(
      'INSERT OR IGNORE INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
      [10, 20, 1],
    );

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO author_books (author_id, book_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [10, 20, 1],
    );
  });

  it('auto-appends RETURNING id for inserts and maps lastID', async () => {
    jest.resetModules();

    mockPoolQuery.mockImplementation(async (text: string) => {
      if (text.startsWith('INSERT INTO users')) {
        return { rows: [{ id: 123 }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const { connectDatabase } = await import('../../db/database');
    const db = await connectDatabase();

    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['A', 'a@b.com', 'pw'],
    );

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      ['A', 'a@b.com', 'pw'],
    );
    expect(result.lastID).toBe(123);
  });

  it('supports BEGIN/COMMIT with a dedicated client', async () => {
    jest.resetModules();
    const { connectDatabase } = await import('../../db/database');
    const db = await connectDatabase();

    await db.run('BEGIN TRANSACTION');
    await db.get('SELECT * FROM users WHERE id = ?', [1]);
    await db.run('COMMIT');

    expect(mockPoolConnect).toHaveBeenCalledTimes(1);
    expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
    expect(mockClientQuery).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1],
    );
    expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    expect(mockClientRelease).toHaveBeenCalledTimes(1);
  });
});
