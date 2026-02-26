async function bootstrap(): Promise<void> {
  process.env.DB_AUTO_BOOTSTRAP = 'false';

  const { bootstrapDatabase, connectDatabase } = await import('../db/database');

  const db = await connectDatabase();
  await bootstrapDatabase(db);

  console.log('Database bootstrap completed successfully');
}

bootstrap().catch((error) => {
  console.error('Database bootstrap failed:', error);
  process.exit(1);
});
