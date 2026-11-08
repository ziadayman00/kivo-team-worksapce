import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database/database.constants';
import { Database } from './database/database.module';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async getHealth() {
    let dbStatus = 'disconnected';
    try {
      await this.db.execute(sql`SELECT 1 as alive`);
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      service: 'kivo-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
