export type QueryParams = unknown[];

export interface DbRunResult {
  lastID?: number;
  changes?: number;
}

export interface DbClient {
  all<T = any>(sql: string, params?: QueryParams): Promise<T[]>;
  get<T = any>(sql: string, params?: QueryParams): Promise<T | undefined>;
  run(sql: string, params?: QueryParams): Promise<DbRunResult>;
  exec(sql: string): Promise<void>;
  close?(): Promise<void>;
}
